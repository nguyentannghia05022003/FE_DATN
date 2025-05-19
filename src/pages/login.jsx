import React, { useContext, useState, useEffect } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, message, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { loginUserApi } from '../services/api.service';
import { AuthContext } from '../components/context/auth.context';

const LoginPage = () => {
    const [formLogin] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { setUser } = useContext(AuthContext);

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedPassword = localStorage.getItem('savedPassword');
        const savedRemember = localStorage.getItem('remember') === 'true';

        if (savedRemember && savedEmail) {
            formLogin.setFieldsValue({
                email: savedEmail,
                password: savedPassword || '',
                remember: savedRemember,
            });
        }
    }, [formLogin]);

    const onFinish = async (values) => {
        setLoading(true);
        const res = await loginUserApi(values.email, values.password);
        if (res.data) {
            message.success("Đăng nhập thành công !");
            localStorage.setItem("access_token", res.data.access_token);
            setUser(res.data.user);
            console.log("Check user: ", res.data.user);

            if (values.remember) {
                localStorage.setItem('savedEmail', values.email);
                localStorage.setItem('savedPassword', values.password);
                localStorage.setItem('remember', 'true');
            } else {
                localStorage.removeItem('savedEmail');
                localStorage.removeItem('savedPassword');
                localStorage.removeItem('remember');
            }

            navigate("/");
        } else {
            notification.error({
                message: "Login Error",
                description: JSON.stringify(res.message),
            });
        }
        setLoading(false);
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        const savedEmail = localStorage.getItem('savedEmail');
        const savedPassword = localStorage.getItem('savedPassword');
        const savedRemember = localStorage.getItem('remember') === 'true';

        if (savedRemember && newEmail === savedEmail && savedPassword) {
            formLogin.setFieldsValue({ password: savedPassword });
        } else {
            formLogin.setFieldsValue({ password: '' });
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                margin: 0,
                padding: 0,
            }}
        >
            <style>
                {`
          .login-form .ant-form-item-explain-error {
            text-align: left !important;
            margin-left: 32px !important;
          }
        `}
            </style>
            <Form
                className="login-form"
                name="login"
                form={formLogin}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                style={{
                    width: '100%',
                    maxWidth: '360px',
                    padding: '40px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    textAlign: "center",
                }}
            >
                <h2
                    style={{
                        marginBottom: 20,
                        fontWeight: 600,
                        color: '#333',
                    }}
                >
                    Đăng nhập
                </h2>

                <Form.Item
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Email không được để trống!',
                        },
                        {
                            type: "email",
                            message: 'Email không đúng định dạng!',
                        },
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Tên đăng nhập"
                        onChange={handleEmailChange}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập mật khẩu!',
                        },
                    ]}
                >
                    <Input.Password
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') formLogin.submit();
                        }}
                        prefix={<LockOutlined />}
                        type="password"
                        placeholder="Mật khẩu"
                    />
                </Form.Item>

                <Form.Item>
                    <Flex justify="space-between" align="center">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                        </Form.Item>
                        <Link to="/">Go To Homepage</Link>
                    </Flex>
                </Form.Item>

                <Form.Item>
                    <Button loading={loading} block type="primary" htmlType="submit">
                        Đăng nhập
                    </Button>
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "10px",
                        }}
                    >
                        hoặc
                        <span
                            onClick={() => navigate("/register")}
                            style={{
                                color: "#1677ff",
                                cursor: "pointer",
                                textDecoration: "underline",
                                marginLeft: "5px",
                            }}
                        >
                            Đăng ký ngay!
                        </span>
                    </div>
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "10px",
                        }}
                    >
                        <span
                            onClick={() => navigate("/forgot-password")} // Ensure this matches the route path
                            style={{
                                color: "#1677ff",
                                cursor: "pointer",
                                textDecoration: "underline",
                            }}
                        >
                            Quên mật khẩu?
                        </span>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
};

export default LoginPage;