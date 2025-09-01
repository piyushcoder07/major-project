import React from 'react';
import { Conversation } from '../types/message';
import { formatMessageTime } from '../utils/messageUtils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (appointmentId: string) => void;
  isLoading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" data-testid="loading-spinner"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-center">No conversations yet</p>
        <p className="text-sm text-center mt-1">Start messaging when you have accepted appointments</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.appointmentId}
          onClick={() => onSelectConversation(conversation.appointmentId)}
          className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedConversationId === conversation.appointmentId ? 'bg-blue-50 border-blue-200' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {conversation.otherUser.name}
                </h3>
                {conversation.lastMessage && (
                  <span className="text-xs text-gray-500 ml-2">
                    {formatMessageTime(conversation.lastMessage.timestamp)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage?.text || 'No messages yet'}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full ml-2">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  conversation.appointment.status === 'ACCEPTED' 
                    ? 'bg-green-100 text-green-800'
                    : conversation.appointment.status === 'COMPLETED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {conversation.appointment.status === 'COMPLETED' ? '✓ Completed' : 
                   conversation.appointment.status === 'ACCEPTED' ? '🟢 Active' :
                   conversation.appointment.status.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};