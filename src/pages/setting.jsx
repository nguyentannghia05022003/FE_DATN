import React from 'react';
import { Tabs } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const Setting = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const items = [
        {
            key: 'change-password',
            label: 'Change Password',
        },
        {
            key: 'infor',
            label: 'Personal Information',
        },
    ];

    const activeKey = location.pathname.includes('infor') ? 'infor' : 'change-password';

    const onChange = (key) => {
        navigate(`/setting/${key}`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Tabs activeKey={activeKey} onChange={onChange} items={items} />
            <Outlet />
        </div>
    );
};

export default Setting;