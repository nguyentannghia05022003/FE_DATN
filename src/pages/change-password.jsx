import React, { useState } from "react";
import { Button, Form, Input, message, notification } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { changePasswordApi } from "../services/api.service";

const ChangePassword = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (values) => {
        setLoading(true);
        try {
            const response = await changePasswordApi(values.oldPassword, values.newPassword);
            if (response.data) {
                message.success("Thay đổi mật khẩu thành công!");
                navigate("/"); // Chuyển hướng về trang chủ hoặc trang khác
            } else {
                notification.error({
                    message: "Lỗi",
                    description: response.message || "Không thể thay đổi mật khẩu. Vui lòng thử lại.",
                });
            }
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
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
                height: "100vh",
                margin: 0,
                padding: 0,
            }}
        >
            <style>
                {`
          .change-password-form .ant-form-item-explain-error {
            text-align: left !important;
            margin-left: 32px !important;
          }
        `}
            </style>
            <Form
                className="change-password-form"
                name="change-password"
                form={form}
                onFinish={handleChangePassword}
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
                    Thay Đổi Mật Khẩu
                </h2>
                <Form.Item
                    name="oldPassword"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập mật khẩu cũ!",
                        },
                        {
                            min: 6,
                            message: "Mật khẩu phải có ít nhất 6 ký tự!",
                        },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Mật khẩu cũ"
                    />
                </Form.Item>
                <Form.Item
                    name="newPassword"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập mật khẩu mới!",
                        },
                        {
                            min: 6,
                            message: "Mật khẩu phải có ít nhất 6 ký tự!",
                        },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Mật khẩu mới"
                    />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    dependencies={["newPassword"]}
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng xác nhận mật khẩu!",
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Xác nhận mật khẩu mới"
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        loading={loading}
                        block
                        type="primary"
                        htmlType="submit"
                    >
                        Thay Đổi Mật Khẩu
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
                            Quay lại trang chủ
                        </span>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ChangePassword;