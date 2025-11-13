import Check from '~/components/icons/check';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

import {
  CATEGORY_OPTIONS,
  EQUIPMENT_NAME_OPTIONS,
  EQUIPMENT_NUMBER_OPTIONS,
  LANGUAGE_OPTIONS,
  ROOM_NUMBER_OPTIONS,
  ROOM_OPTIONS,
} from '../const/manual-options';
import { FileMetadata } from '../const/upload-types';

interface MetadataSelectionProps {
  metadata: FileMetadata;
  onMetadataChange: (metadata: FileMetadata) => void;
}

export default function MetadataSelection({ metadata, onMetadataChange }: MetadataSelectionProps) {
  const handleMetadataChange = (field: keyof FileMetadata, value: string) => {
    onMetadataChange({ ...metadata, [field]: value });
  };

  return (
    <div className='w-full max-w-[750px] space-y-[28px]'>
      {/* 언어 - 1줄 */}
      <div className='flex flex-col gap-2'>
        <label htmlFor='language' className='text-[14px] font-[500] text-grey-700'>
          언어
        </label>
        <Select value={metadata.language} onValueChange={(value) => handleMetadataChange('language', value)}>
          <SelectTrigger className='w-full border-none bg-slate-100'>
            <SelectValue placeholder='언어를 선택하세요' className='text-grey-900'>
              {metadata.language
                ? LANGUAGE_OPTIONS.find((opt) => opt.value === metadata.language)?.label
                : '언어를 선택하세요'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className='max-h-[180px] w-full overflow-y-auto p-1'>
            {LANGUAGE_OPTIONS.map((option) => (
              <div key={option.value}>
                <SelectItem value={option.value} className='rounded-[6px] p-2 hover:bg-blue-50'>
                  <div className='flex w-[200px] items-center justify-between gap-2'>
                    <span className={metadata.language === option.value ? 'text-blue-700' : 'text-grey-700'}>
                      {option.label}
                    </span>
                    {metadata.language === option.value && <Check color='var(--blue700)' />}
                  </div>
                </SelectItem>
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 구분, 설명, 실번호 - 3줄 */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='category' className='text-[14px] font-[500] text-grey-700'>
            구분
          </label>
          <Select value={metadata.category} onValueChange={(value) => handleMetadataChange('category', value)}>
            <SelectTrigger className='w-full border-none bg-slate-100'>
              <SelectValue placeholder='구분을 선택하세요' className='text-grey-900'>
                {metadata.category
                  ? CATEGORY_OPTIONS.find((opt) => opt.value === metadata.category)?.label
                  : '구분을 선택하세요'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className='max-h-[180px] w-full overflow-y-auto p-1'>
              {CATEGORY_OPTIONS.map((option) => (
                <div key={option.value}>
                  <SelectItem value={option.value} className='rounded-[6px] p-2 hover:bg-blue-50'>
                    <div className='flex w-[230px] items-center justify-between gap-2'>
                      <span className={metadata.category === option.value ? 'text-blue-700' : 'text-grey-700'}>
                        {option.label}
                      </span>
                      {metadata.category === option.value && <Check color='var(--blue700)' />}
                    </div>
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-2'>
          <label htmlFor='description' className='text-[14px] font-[500] text-grey-700'>
            설명
          </label>
          <Select value={metadata.description} onValueChange={(value) => handleMetadataChange('description', value)}>
            <SelectTrigger className='w-full border-none bg-slate-100'>
              <SelectValue placeholder='설명을 선택하세요' className='text-grey-900'>
                {metadata.description
                  ? ROOM_OPTIONS.find((opt) => opt.value === metadata.description)?.label
                  : '설명을 선택하세요'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className='max-h-[180px] w-full overflow-y-auto p-1'>
              {ROOM_OPTIONS.map((option) => (
                <div key={option.value}>
                  <SelectItem value={option.value} className='rounded-[6px] p-2 hover:bg-blue-50'>
                    <div className='flex w-[200px] items-center justify-between gap-2'>
                      <span className={metadata.description === option.value ? 'text-blue-700' : 'text-grey-700'}>
                        {option.label}
                      </span>
                      {metadata.description === option.value && <Check color='var(--blue700)' />}
                    </div>
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-2'>
          <label htmlFor='roomNumber' className='text-[14px] font-[500] text-grey-700'>
            실번호
          </label>
          <Select value={metadata.roomNumber} onValueChange={(value) => handleMetadataChange('roomNumber', value)}>
            <SelectTrigger className='w-full border-none bg-slate-100'>
              <SelectValue placeholder='실번호를 선택하세요' className='text-grey-900'>
                {metadata.roomNumber
                  ? ROOM_NUMBER_OPTIONS.find((opt) => opt.value === metadata.roomNumber)?.label
                  : '실번호를 선택하세요'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className='max-h-[180px] w-full overflow-y-auto p-1'>
              {ROOM_NUMBER_OPTIONS.map((option) => (
                <div key={option.value}>
                  <SelectItem value={option.value} className='rounded-[6px] p-2 hover:bg-blue-50'>
                    <div className='flex w-[200px] items-center justify-between gap-2'>
                      <span className={metadata.roomNumber === option.value ? 'text-blue-700' : 'text-grey-700'}>
                        {option.label}
                      </span>
                      {metadata.roomNumber === option.value && <Check color='var(--blue700)' />}
                    </div>
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 장비명, 장비번호 - 2줄 */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='equipmentName' className='text-[14px] font-[500] text-grey-700'>
            장비명
          </label>
          <Select
            value={metadata.equipmentName}
            onValueChange={(value) => handleMetadataChange('equipmentName', value)}
          >
            <SelectTrigger className='w-full border-none bg-slate-100'>
              <SelectValue placeholder='장비명을 선택하세요' className='text-grey-900'>
                {metadata.equipmentName
                  ? EQUIPMENT_NAME_OPTIONS.find((opt) => opt.value === metadata.equipmentName)?.label
                  : '장비명을 선택하세요'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className='max-h-[180px] w-full overflow-y-auto p-1'>
              {EQUIPMENT_NAME_OPTIONS.map((option) => (
                <div key={option.value}>
                  <SelectItem value={option.value} className='rounded-[6px] p-2 hover:bg-blue-50'>
                    <div className='flex w-[200px] items-center justify-between gap-2'>
                      <span className={metadata.equipmentName === option.value ? 'text-blue-700' : 'text-grey-700'}>
                        {option.label}
                      </span>
                      {metadata.equipmentName === option.value && <Check color='var(--blue700)' />}
                    </div>
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-2'>
          <label htmlFor='equipmentNumber' className='text-[14px] font-[500] text-grey-700'>
            장비번호
          </label>
          <Select
            value={metadata.equipmentNumber}
            onValueChange={(value) => handleMetadataChange('equipmentNumber', value)}
          >
            <SelectTrigger className='w-full border-none bg-slate-100'>
              <SelectValue placeholder='장비번호를 선택하세요' className='text-grey-900'>
                {metadata.equipmentNumber
                  ? EQUIPMENT_NUMBER_OPTIONS.find((opt) => opt.value === metadata.equipmentNumber)?.label
                  : '장비번호를 선택하세요'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className='max-h-[180px] w-full overflow-y-auto p-1'>
              {EQUIPMENT_NUMBER_OPTIONS.map((option) => (
                <div key={option.value}>
                  <SelectItem value={option.value} className='rounded-[6px] p-2 hover:bg-blue-50'>
                    <div className='flex w-[200px] items-center justify-between gap-2'>
                      <span className={metadata.equipmentNumber === option.value ? 'text-blue-700' : 'text-grey-700'}>
                        {option.label}
                      </span>
                      {metadata.equipmentNumber === option.value && <Check color='var(--blue700)' />}
                    </div>
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
