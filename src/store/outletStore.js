import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { OUTLET_ID, OUTLET_NAME, OUTLET_TYPE } from '../constants/constantsPlus';

const useOutletStore = create(devtools(() => ({
  outletId: OUTLET_ID,
  outletName: OUTLET_NAME,
  outletType: OUTLET_TYPE,
}), { name: 'outletStore' }));

export default useOutletStore;