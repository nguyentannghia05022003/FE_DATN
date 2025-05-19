// src/components/Header.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Menu, message, Layout, Avatar, Badge, Dropdown, Switch, Popover } from 'antd';
import {
    AliwangwangOutlined,
    HomeOutlined,
    LoginOutlined,
    SolutionOutlined,
    UserOutlined,
    BellOutlined,
    SettingOutlined,
    TeamOutlined,
    BarsOutlined,
    LogoutOutlined,
    BankOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import './header.css';
import { AuthContext } from '../context/auth.context';
import { logoutApi } from '../../services/api.service';

const { Sider, Content, Footer, Header: AntHeader } = Layout;

const Header = () => {
    const [collapsed, setCollapsed] = useState(window.innerWidth <= 768); // Thu gọn Sider trên mobile
    const [current, setCurrent] = useState('home');
    const [darkMode, setDarkMode] = useState(false);
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location && location.pathname) {
            const allRoutes = [
                'users',
                'products',
                'app',
                'banking',
                'resumes',
                'setting',
                'setting/change-password',
                'setting/infor',
            ];
            const currentRoute = allRoutes.find((item) => `/${item}` === location.pathname);
            setCurrent(currentRoute || 'home');
        }
    }, [location]);

    useEffect(() => {
        document.body.className = darkMode ? 'dark-mode' : 'light-mode';
    }, [darkMode]);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleLogout = async () => {
        try {
            const res = await logoutApi();
            if (res.data) {
                localStorage.removeItem('access_token');
                message.success('Logout Success!');
                setUser({ email: '', phone: '', fullName: '', role: '', avatar: '', _id: '' });
                navigate('/');
            }
        } catch (error) {
            message.error('Logout Failed!');
        }
    };

    const items = [
        {
            label: <Link to='/'>Dashboard</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        {
            label: <Link to='/users'>Users</Link>,
            key: 'users',
            icon: <UserOutlined />,
        },
        {
            label: <Link to='/app'>App User</Link>,
            key: 'app',
            icon: <TeamOutlined />,
        },
        {
            label: <Link to='/products'>Products</Link>,
            key: 'products',
            icon: <SolutionOutlined />,
        },
        {
            label: <Link to='/banking'>Banking</Link>,
            key: 'banking',
            icon: <BankOutlined />,
        },
        {
            label: <Link to='/resumes'>Resumes</Link>,
            key: 'resumes',
            icon: <FileTextOutlined />,
        },
        {
            label: 'Setting',
            key: 'setting',
            icon: <SettingOutlined />,
            children: [
                {
                    label: <Link to='/setting/change-password'>Change Password</Link>,
                    key: 'setting/change-password',
                },
                {
                    label: <Link to='/setting/infor'>Personal Information</Link>,
                    key: 'setting/infor',
                },
            ],
        },
    ];

    const avatarMenu = {
        items: [
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                onClick: handleLogout,
            },
        ],
    };

    const notifications = (
        <div style={{ maxWidth: '250px' }}>
            <p><b>🔔 Thông báo 1:</b> Bạn có sách mới cần duyệt</p>
            <p><b>🔔 Thông báo 2:</b> Có đăng nhập từ thiết bị lạ</p>
            <p><b>🔔 Thông báo 3:</b> Cập nhật chính sách sử dụng</p>
        </div>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={toggleCollapsed}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    height: '100vh',
                    zIndex: 101,
                }}
                breakpoint="md" // Tự động thu gọn trên màn hình nhỏ hơn 768px
                collapsedWidth={window.innerWidth <= 768 ? 0 : 80} // Ẩn hoàn toàn trên mobile khi collapsed
            >
                <div className='logo' style={{ height: '32px', margin: '16px' }} />
                <Menu selectedKeys={[current]} mode='inline' theme='dark' items={items} />
            </Sider>
            <Layout
                style={{
                    marginLeft: collapsed ? (window.innerWidth <= 768 ? 0 : 80) : 200,
                    transition: 'margin-left 0.2s',
                }}
            >
                <AntHeader className='top-header'>
                    <div className='header-left'>
                        <BarsOutlined onClick={toggleCollapsed} style={{ fontSize: '20px', cursor: 'pointer' }} />
                        <h3 style={{ marginLeft: '10px', display: 'inline' }}>
                            {collapsed ? 'Expand Menu' : 'Collapse Menu'}
                        </h3>
                    </div>
                    <div className='header-right'>
                        <Popover content={notifications} title="Thông báo" trigger="click" placement="bottomRight">
                            <Badge count={''} overflowCount={9}>
                                <BellOutlined style={{ fontSize: '20px', marginRight: '20px', cursor: 'pointer' }} />
                            </Badge>
                        </Popover>

                        <Switch
                            checked={darkMode}
                            onChange={toggleDarkMode}
                            checkedChildren='Dark'
                            unCheckedChildren='Light'
                            style={{ marginRight: '20px' }}
                        />

                        {user && user.fullName ? (
                            <Dropdown menu={avatarMenu} placement="bottomRight" trigger={['click']}>
                                <div className='user-info' style={{ cursor: 'pointer' }}>
                                    <span style={{ marginRight: '10px' }}>Welcome, {user.fullName}</span>
                                    <Avatar
                                        src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`}
                                        size={40}
                                    />
                                </div>
                            </Dropdown>
                        ) : (
                            <Link to='/login'>Đăng Nhập</Link>
                        )}
                    </div>
                </AntHeader>
                <Content style={{ margin: '16px', padding: '0 8px' }}>
                    <div style={{ padding: 16, minHeight: 360, background: darkMode ? '#333' : '#fff' }}>
                        <Outlet />
                    </div>
                </Content>
                <Footer
                    style={{
                        textAlign: 'center',
                        background: darkMode ? '#1f1f1f' : '#282c34',
                        color: '#fff',
                        padding: '14px 0',
                    }}
                >
                    React Vite - @Nguyen Tan Nghia
                </Footer>
            </Layout>
        </Layout>
    );
};

export default Header;