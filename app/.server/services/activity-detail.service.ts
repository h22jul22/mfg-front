import { BASE_URL } from '~/lib/api';

import { getEmployeeIdCookie } from '../lib/utils';

export const getActivityDetail = async (params: any, request: any) => {
  const { id } = params;
  const cookie = request.headers.get('Cookie');
  const employeeId = getEmployeeIdCookie(cookie);

  const res = await fetch(`${BASE_URL}/v1/activity/query/activity_detail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      userId: employeeId,
    },
    body: JSON.stringify({
      activityId: id,
      employeeId,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    return data.activityDetail;
  }
  return null;
};
