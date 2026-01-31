
import { API_ENDPOINT, LOGGING_API_ENDPOINT } from '../constants';
import { UserData, ValidationResponse, UserStatus } from '../types';

/**
 * ฟังก์ชันภายในสำหรับส่งคำขอ JSONP พร้อมระบบ Timeout ที่ยืดหยุ่น
 */
const performJsonpRequest = (identifier: string, timeoutMs: number): Promise<ValidationResponse> => {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_callback_${Date.now()}_${Math.round(Math.random() * 100000)}`;
    const script = document.createElement('script');
    let isFinished = false;

    const cleanup = () => {
      isFinished = true;
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete (window as any)[callbackName];
    };

    // 1. กำหนด Callback
    (window as any)[callbackName] = (response: any) => {
      if (isFinished) return;
      cleanup();

      if (response && response.status === 'success' && response.data) {
        resolve({
          status: UserStatus.MEMBER,
          name: response.data.name,
          memberId: response.data.memberId,
        });
      } else if (response && response.status === 'not_found') {
        resolve({ status: UserStatus.NON_MEMBER });
      } else {
        console.warn('API returned unexpected response:', response);
        resolve({ status: UserStatus.INVALID });
      }
    };

    // 2. จัดการ Error (Script load failure หรือ Syntax error จากหน้า HTML ของ Google)
    script.onerror = () => {
      if (isFinished) return;
      cleanup();
      // "Script error." มักเกิดจาก Google ส่งหน้า HTML Error มาแทนสคริปต์
      reject(new Error('ไม่สามารถประมวลผลข้อมูลได้ (Script Error)'));
    };

    // 3. สร้าง URL พร้อม Cache Buster
    const url = new URL(API_ENDPOINT);
    url.searchParams.append('memberId', identifier);
    url.searchParams.append('callback', callbackName);
    url.searchParams.append('_cache', Date.now().toString() + Math.random().toString(36).substring(7));

    script.src = url.toString();
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // 4. ตั้งเวลา Timeout
    const timeoutId = setTimeout(() => {
      if (isFinished) return;
      cleanup();
      reject(new Error('Timeout'));
    }, timeoutMs);

    // ล้าง Timeout เมื่อสำเร็จ
    const originalResolve = resolve;
    resolve = (val: any) => {
      clearTimeout(timeoutId);
      originalResolve(val);
    };
  });
};

export const validateUser = async (data: UserData): Promise<ValidationResponse> => {
  if (!data.identifier) {
    return { status: UserStatus.INVALID };
  }

  const MAX_RETRIES = 2;
  const INITIAL_TIMEOUT = 35000; // 35 วินาที

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const currentTimeout = attempt === 1 ? INITIAL_TIMEOUT : INITIAL_TIMEOUT + 10000;
      return await performJsonpRequest(data.identifier, currentTimeout);
    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES;
      const errorMsg = error instanceof Error ? error.message : 'Unknown';
      
      console.warn(`Validation Attempt ${attempt} failed: ${errorMsg}`);

      if (isLastAttempt) {
        if (errorMsg === 'Timeout') {
          throw new Error('การเชื่อมต่อใช้เวลานานเกินไป กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง');
        } else if (errorMsg.includes('Script Error')) {
          throw new Error('เซิร์ฟเวอร์ขัดข้องชั่วคราว (Quota Exceeded) กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
        }
        throw new Error('ไม่สามารถตรวจสอบข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
      }
      
      // หน่วงเวลาก่อนลองใหม่
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  return { status: UserStatus.INVALID };
};

const formatTimestampForSheet = (date: Date): string => {
  const pad = (num: number) => String(num).padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export const logUsage = async (data: UserData & { branchName: string | null; couponName: string; couponDescription: string; couponCode: string; memberName: string | null; status?: string; }): Promise<void> => {
  const payload = {
    action: 'log',
    timestamp: formatTimestampForSheet(new Date()),
    identifier: data.identifier,
    couponName: data.couponName,
    couponDescription: data.couponDescription,
    couponCode: data.couponCode,
    memberName: data.memberName || '',
    branchName: data.branchName || '',
    status: data.status || 'Used',
  };

  try {
    fetch(LOGGING_API_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    }).catch(e => console.error('Background log failed:', e));
  } catch (error) {
    console.error('Logging setup error:', error);
  }
};
