// 파일명을 지정된 길이로 제한하는 유틸리티 함수
export const truncateFileName = (fileName: string, maxLength: number = 30) => {
  if (fileName.length <= maxLength) return fileName;
  return fileName.substring(0, maxLength) + '...';
};
