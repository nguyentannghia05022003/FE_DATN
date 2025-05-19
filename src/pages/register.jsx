import { Button, Form, Input, notification } from "antd";
import { registerUserApi } from "../services/api.service";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const [formRegister] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        if (values.phone && !values.phone.startsWith("0")) {
            values.phone = "0" + values.phone;
        }
        //console.log(">>> Check Values: ", values);

        const res = await registerUserApi(
            values.fullName,
            values.email,
            values.password,
            values.phone
        );
        //console.log(">>> Check res: ", res)
        if (res.data) {
            notification.success({
                message: "Register User",
                description: "Đăng ký user thành công!",
            });
            navigate("/login");
        } else {
            notification.error({
                message: "Register User Error",
                description: JSON.stringify(res.message),
            });
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            //backgroundColor: '#eef2f7',
        }}>
            <Form
                name="register"
                form={formRegister}
                layout="vertical"
                onFinish={onFinish}
                style={{
                    width: '100%',
                    maxWidth: 450,
                    padding: '30px',
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
                    textAlign: 'center',
                }}
            >
                <h2 style={{ marginBottom: 20, fontWeight: 600, color: '#333' }}>
                    Create an Account
                </h2>

                <Form.Item
                    label="Full Name"
                    name="fullName"
                    rules={[{ required: true, message: 'Please input your full name!' }]}
                >
                    <Input placeholder="Enter your full name" />
                </Form.Item>

                <Form.Item
                    label="E-mail"
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: "email", message: "Invalid email format!" },
                    ]}
                >
                    <Input placeholder="Enter your email" />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password placeholder="Enter your password" />
                </Form.Item>

                <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[
                        { required: true, message: 'Please input your phone number!' },
                        { pattern: /^[0-9]{9}$/, message: 'Phone number must be 9 digits!' }
                    ]}
                >
                    <Input addonBefore="+84" maxLength={9} placeholder="Enter your phone number" />
                </Form.Item>

                <Button type="primary" htmlType="submit" block style={{
                    backgroundColor: "#1677ff",
                    borderRadius: "8px",
                    fontSize: "16px",
                    height: "40px",
                    marginTop: "15px"
                }}>
                    Register
                </Button>

                <p style={{ marginTop: 15 }}>
                    Already have an account?
                    <span
                        onClick={() => navigate("/login")}
                        style={{ color: "#1677ff", cursor: "pointer", textDecoration: "underline" }}
                    >
                        Login here
                    </span>
                </p>
            </Form>
        </div>
    );
};

export default RegisterPage;
