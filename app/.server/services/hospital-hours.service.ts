import { fetchJson } from '~/lib/utils';
import { BASE_URL } from '~/lib/api';

export const getClinicHours = async (companyId: string) => {
  const data = await fetchJson(
    `${BASE_URL}/v1/clinicHours/query/clinic_hours?companyId=${companyId}`,
  );

  return data;
};

export const getClosingHours = async (companyId: string) => {
  const data = await fetchJson(
    `${BASE_URL}/v1/closingHours/query/closing_hours?companyId=${companyId}`,
  );

  return data;
};
