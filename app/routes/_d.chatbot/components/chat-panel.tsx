import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import { Button } from '~/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  files?: FileAttachment[];
  timestamp: Date;
  loading?: boolean;
}

interface FileAttachment {
  id: string;
  name: string;
  pages: number;
}

interface ChatPanelProps {
  messages: Message[];
  onResetChat?: () => void;
  isLoading?: boolean;
  loadingPercent?: number;
}

const ChatPanel = ({ messages, onResetChat, isLoading, loadingPercent }: ChatPanelProps) => {
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
      {messages.map((message) => {
        const isUser = message.role === 'user';
        const isAiLoading = message.role === 'ai' && (message as any).loading;

        return (
          <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`w-full rounded-lg p-3 ${
                isUser
                  ? 'animate-pop-up max-w-[40%] bg-grey-100 text-grey-800'
                  : 'animate-pop-up max-w-[70%] text-grey-800'
              }`}
            >
              {/* 로딩 중인 AI 말풍선 */}
              {isAiLoading ? (
                <div className='animate-pulse text-grey-600 typography-4-regular'>
                  답변을 불러오는 중입니다... ({loadingPercent}%)
                </div>
              ) : (
                <div className='prose max-w-none'>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* 파일 첨부 (로딩 중일 땐 숨김) */}
              {!isAiLoading && message.files && message.files.length > 0 && (
                <div className='mt-3 space-y-2'>
                  {message.files.map((file) => (
                    <Collapsible key={file.id} open={openFiles.has(file.id)} onOpenChange={() => toggleFile(file.id)}>
                      <CollapsibleTrigger
                        className={`flex w-full items-center justify-between border border-grey-300 bg-white p-[14px_16px] hover:bg-grey-50 ${
                          openFiles.has(file.id) ? 'rounded-t border-b-transparent' : 'rounded-sm'
                        }`}
                      >
                        <span className='text-grey-800 typography-4-regular'>
                          {file.name}, {file.pages}p
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${openFiles.has(file.id) ? 'rotate-180' : ''}`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className='relative w-full rounded-b border border-grey-300 border-t-transparent bg-white p-3'>
                        <div className='absolute left-2 top-0 w-[calc(100%-16px)] border-b border-grey-300' />
                        <div className='text-grey-600 typography-3-regular'>
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
        );
      })}

      {!isLoading && (
        <Button variant='default' className='mb-4 ml-[12px] bg-black' onClick={onResetChat}>
          Reset Chat History
        </Button>
      )}
    </div>
  );
};

export default ChatPanel;
