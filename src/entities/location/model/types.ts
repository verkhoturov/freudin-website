/** Город из справочника GeoNames. `region` отличает одноимённые города страны: Portland, Oregon. */
export type City = {
  id: number;
  name: string;
  region: string;
  countryCode: string;
};
