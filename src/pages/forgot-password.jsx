import React, { useState } from 'react';
import { Button, Form, Input, message, notification } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { forgotPasswordApi, resetPasswordApi } from '../services/api.service';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [form] = Form.useForm();
    const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter OTP and new password
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const onSendOtp = async (values) => {
        setLoading(true);
        try {
            const res = await forgotPasswordApi(values.email);
            if (res.data) {
                message.success('OTP đã được gửi tới email của bạn!');
                setEmail(values.email);
                setStep(2);
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: JSON.stringify(res.message),
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Có lỗi xảy ra, vui lòng thử lại!',
            });
        }
        setLoading(false);
    };

    const onResetPassword = async (values) => {
        setLoading(true);
        try {
            const res = await resetPasswordApi(values.otp, values.newPassword);
            if (res.data) {
                message.success('Đặt lại mật khẩu thành công!');
                navigate('/login');
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: JSON.stringify(res.message),
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Có lỗi xảy ra, vui lòng thử lại!',
            });
        }
        setLoading(false);
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
            <Form
                form={form}
                onFinish={step === 1 ? onSendOtp : onResetPassword}
                style={{
                    width: '100%',
                    maxWidth: '360px',
                    padding: '40px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                }}
            >
                <h2
                    style={{
                        marginBottom: 20,
                        fontWeight: 600,
                        color: '#333',
                    }}
                >
                    {step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
                </h2>

                {step === 1 ? (
                    <>
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Email không được để trống!',
                                },
                                {
                                    type: 'email',
                                    message: 'Email không đúng định dạng!',
                                },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="Nhập email của bạn"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                loading={loading}
                                block
                                type="primary"
                                htmlType="submit"
                            >
                                Gửi OTP
                            </Button>
                        </Form.Item>
                    </>
                ) : (
                    <>
                        <Form.Item
                            name="otp"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mã OTP!',
                                },
                            ]}
                        >
                            <Input
                                placeholder="Nhập mã OTP"
                            />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu mới!',
                                },
                                {
                                    min: 6,
                                    message: 'Mật khẩu phải có ít nhất 6 ký tự!',
                                },
                            ]}
                        >
                            <Input.Password
                                placeholder="Nhập mật khẩu mới"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                loading={loading}
                                block
                                type="primary"
                                htmlType="submit"
                            >
                                Đặt lại mật khẩu
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form>
        </div>
    );
};

export default ForgotPassword;