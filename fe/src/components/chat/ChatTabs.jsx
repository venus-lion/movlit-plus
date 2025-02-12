import React from 'react';
import "./ChatTabHover.css";

const ChatTabs = ({activeTab, setActiveTab}) => {
    return (
        <div className="chat-tabs">
            <button
                className={`chat-button ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
            >
                개인 채팅
            </button>
            <button
                className={`group-chat-button ${activeTab === 'group' ? 'active' : ''}`}
                onClick={() => setActiveTab('group')}
            >
                그룹 채팅
            </button>
        </div>
    );
};

export default ChatTabs;
