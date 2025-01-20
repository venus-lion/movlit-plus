import React from 'react';

const ChatTabs = ({activeTab, setActiveTab}) => {
    return (
        <div style={{display: 'flex', marginBottom: '10px'}}>
            <button
                style={{
                    flex: 1,
                    padding: '10px',
                    background: activeTab === 'personal' ? 'green' : '#6f6b6b',
                    border: '1px solid #ddd',
                    borderBottom: activeTab === 'personal' ? '2px solid blue' : 'none',
                    cursor: 'pointer',
                }}
                onClick={() => setActiveTab('oneOnOne')}
            >
                1:1 채팅
            </button>
            <button
                style={{
                    flex: 1,
                    padding: '10px',
                    background: activeTab === 'group' ? 'green' : '#6f6b6b',
                    border: '1px solid #ddd',
                    borderBottom: activeTab === 'group' ? '2px solid blue' : 'none',
                    cursor: 'pointer',
                }}
                onClick={() => setActiveTab('group')}
            >
                그룹 채팅
            </button>
            <button
                style={{
                    flex: 1,
                    padding: '10px',
                    background: activeTab === 'popular' ? 'green' : '#6f6b6b',
                    border: '1px solid #ddd',
                    borderBottom: activeTab === 'popular' ? '2px solid blue' : 'none',
                    cursor: 'pointer',
                }}
                onClick={() => setActiveTab('popular')}
            >
                인기 그룹톡
            </button>
        </div>
    );
};

export default ChatTabs;
