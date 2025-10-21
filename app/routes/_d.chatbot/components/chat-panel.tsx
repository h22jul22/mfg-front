import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  files?: FileAttachment[];
  timestamp: Date;
}

interface FileAttachment {
  id: string;
  name: string;
  pages: number;
}

interface ChatPanelProps {
  messages: Message[];
  onResetChat?: () => void;
}

const ChatPanel = ({ messages, onResetChat }: ChatPanelProps) => {
  const [openFiles, setOpenFiles] = useState<Set<string>>(new Set());
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const toggleFile = (fileId: string) => {
    const newOpenFiles = new Set(openFiles);
    if (newOpenFiles.has(fileId)) {
      newOpenFiles.delete(fileId);
    } else {
      newOpenFiles.add(fileId);
    }
    setOpenFiles(newOpenFiles);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div ref={chatBodyRef} className='flex-1 overflow-hidden p-4'>
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`w-full rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-grey-100 text-grey-800 animate-pop-up max-w-[40%]'
                : 'animate-pop-up text-grey-800 max-w-[70%]'
            }`}
          >
            <p className='typography-4-regular whitespace-pre-wrap'>{message.content}</p>

            {/* 파일 첨부 */}
            {message.files && message.files.length > 0 && (
              <div className='mt-3 space-y-2'>
                {message.files.map((file) => (
                  <Collapsible key={file.id} open={openFiles.has(file.id)} onOpenChange={() => toggleFile(file.id)}>
                    <CollapsibleTrigger
                      className={`border-grey-300 hover:bg-grey-50 flex w-full items-center justify-between border bg-white p-[14px_16px] ${
                        openFiles.has(file.id) ? 'rounded-t border-b-transparent' : 'rounded-sm'
                      }`}
                    >
                      <span className='typography-4-regular text-grey-800'>
                        {file.name}, {file.pages}p
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openFiles.has(file.id) ? 'rotate-180' : ''}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className='border-grey-300 relative w-full rounded-b border border-t-transparent bg-white p-3'>
                      <div className='border-grey-300 absolute left-2 top-0 w-[calc(100%-16px)] border-b' />
                      <div className='typography-3-regular text-grey-600'>
                        <p>
                          이곳에 {file.name} 파일의 내용이 표시됩니다. 실제 구현에서는 파일의 내용을 읽어와서 표시하면
                          됩니다.
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      <Button variant='default' className='mb-4 ml-[12px] bg-black' onClick={onResetChat}>
        Reset Chat History
      </Button>
    </div>
  );
};

export default ChatPanel;
