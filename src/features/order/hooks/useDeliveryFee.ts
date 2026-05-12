import { useEffect, useState } from 'react';
import { getDeliveryFee, isServiceablePostcode } from '@/data/deliveryZones';

export interface UseDeliveryFeeResult {
  fee: number;
  zoneLabel: string;
  estimatedTime: string;
  isServiceable: boolean;
  isLoading: boolean;
}

const PICKUP_RESULT: UseDeliveryFeeResult = {
  fee: 0,
  zoneLabel: 'Self Pickup',
  estimatedTime: '',
  isServiceable: true,
  isLoading: false,
};

const IDLE_RESULT: UseDeliveryFeeResult = {
  fee: 0,
  zoneLabel: '',
  estimatedTime: '',
  isServiceable: false,
  isLoading: false,
};

export function useDeliveryFee(
  postcode: string,
  deliveryType: 'delivery' | 'pickup',
): UseDeliveryFeeResult {
  const [result, setResult] = useState<UseDeliveryFeeResult>(IDLE_RESULT);

  useEffect(() => {
    if (deliveryType === 'pickup') {
      setResult(PICKUP_RESULT);
      return;
    }

    // Incomplete postcode — reset without showing a loading spinner
    if (postcode.length !== 5) {
      setResult(IDLE_RESULT);
      return;
    }

    setResult((prev) => ({ ...prev, isLoading: true }));

    const timer = setTimeout(() => {
      if (!isServiceablePostcode(postcode)) {
        setResult({ ...IDLE_RESULT, isServiceable: false, isLoading: false });
        return;
      }

      const info = getDeliveryFee(postcode)!;
      setResult({
        fee: info.fee,
        zoneLabel: info.label,
        estimatedTime: info.estimatedTime,
        isServiceable: true,
        isLoading: false,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [postcode, deliveryType]);

  return result;
}
