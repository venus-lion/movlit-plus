import React from 'react';
import "./ChatTabHover.css";

const ChatTabs = ({activeTab, setActiveTab}) => {
    return (
        <div className="chat-tabs">
            {/*<button*/}
            {/*    style={{*/}
            {/*        flex: 1,*/}
            {/*        padding: '10px',*/}
            {/*        background: activeTab === 'personal' ? 'green' : '#6f6b6b',*/}
            {/*        border: '1px solid #ddd',*/}
            {/*        borderBottom: activeTab === 'personal' ? '2px solid blue' : 'none',*/}
            {/*        cursor: 'pointer',*/}
            {/*    }}*/}
            {/*    onClick={() => setActiveTab('personal')}*/}
            {/*>*/}
            <button
                className='chat-button'
                onClick={() => setActiveTab('personal')}
            >
                개인 채팅
            </button>
            {/*<button*/}
            {/*    style={{*/}
            {/*        flex: 1,*/}
            {/*        padding: '10px',*/}
            {/*        background: activeTab === 'group' ? 'green' : '#6f6b6b',*/}
            {/*        border: '1px solid #ddd',*/}
            {/*        borderBottom: activeTab === 'group' ? '2px solid blue' : 'none',*/}
            {/*        cursor: 'pointer',*/}
            {/*    }}*/}
            {/*    onClick={() => setActiveTab('group')}*/}
            {/*>*/}
            <button
                className='group-chat-button'
                onClick={() => setActiveTab('group')}
            >
                그룹 채팅
            </button>
        </div>
    );
};

export default ChatTabs;
