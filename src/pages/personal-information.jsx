import React, { useContext, useState } from 'react';
import { Button, Form, Input, message, notification } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { updateUserApi } from '../services/api.service';

const PersonalInformation = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { user, setUser } = useContext(AuthContext);

    const initialValues = {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
    };

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            const response = await updateUserApi(user._id, values.fullName, values.phone);
            if (response.data) {
                message.success("Update profile successfully!");
                setUser({ ...user, fullName: values.fullName, phone: values.phone });
                navigate("/setting/infor");
            } else {
                notification.error({
                    message: "Error",
                    description: response.message || "Cannot update profile. Please try again.",
                });
            }
        } catch (error) {
            notification.error({
                message: "Error",
                description: "An error occurred. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                margin: 0,
                padding: 0,
            }}
        >
            <style>
                {`
          .personal-info-form .ant-form-item-explain-error {
            text-align: left !important;
            margin-left: 32px !important;
          }
        `}
            </style>
            <Form
                className="personal-info-form"
                name="personal-info"
                form={form}
                initialValues={initialValues}
                onFinish={handleUpdateProfile}
                style={{
                    width: "100%",
                    maxWidth: "360px",
                    padding: "40px",
                    background: "#ffffff",
                    borderRadius: "10px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    textAlign: "center",
                }}
            >
                <h2
                    style={{
                        marginBottom: 20,
                        fontWeight: 600,
                        color: "#333",
                    }}
                >
                    Personal Information
                </h2>
                <Form.Item
                    name="fullName"
                    rules={[
                        {
                            required: true,
                            message: "Please enter your full name!",
                        },
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Full Name"
                    />
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: "Please enter your email!",
                        },
                        {
                            type: "email",
                            message: "Invalid email format!",
                        },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="Email"
                        disabled
                    />
                </Form.Item>
                <Form.Item
                    name="phone"
                    rules={[
                        {
                            required: true,
                            message: "Please enter your phone number!",
                        },
                        {
                            pattern: /^[0-9]{10,11}$/,
                            message: "Invalid phone number!",
                        },
                    ]}
                >
                    <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Phone Number"
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        loading={loading}
                        block
                        type="primary"
                        htmlType="submit"
                    >
                        Update Profile
                    </Button>
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "10px",
                        }}
                    >
                        <span
                            onClick={() => navigate("/")}
                            style={{
                                color: "#1677ff",
                                cursor: "pointer",
                                textDecoration: "underline",
                            }}
                        >
                            Back to Homepage
                        </span>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
};

export default PersonalInformation;