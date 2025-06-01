import { Form, Input, InputNumber, Modal, notification } from "antd";
import { useEffect } from "react";
import { updateProductAPI } from "../../services/api.product";
import dayjs from "dayjs";

const UpdateProductUnControl = (props) => {
    const {
        dataUpdate,
        setDataUpdate,
        loadProduct,
        isModalUpdateOpen,
        setIsModalUpdateOpen,
    } = props;

    const [form] = Form.useForm();

    useEffect(() => {
        if (dataUpdate && dataUpdate._id) {
            form.setFieldsValue({
                id: dataUpdate._id,
                barCode: dataUpdate.barCode,
                name: dataUpdate.mainText || dataUpdate.name,
                price: dataUpdate.price,
                quantity: dataUpdate.quantity,
                manufacturingDate: dataUpdate.manufacturingDate
                    ? dayjs(dataUpdate.manufacturingDate).format("YYYY-MM-DD")
                    : null,
                expirationDate: dataUpdate.expirationDate
                    ? dayjs(dataUpdate.expirationDate).format("YYYY-MM-DD")
                    : null,
                image: dataUpdate.image,
            });
        }
    }, [dataUpdate]);

    const handleSubmitBtn = async () => {
        const values = form.getFieldsValue();

        if (!values.barCode || values.barCode.length < 5) {
            notification.error({
                message: "Error Update Product",
                description: "Mã BarCode phải có ít nhất 5 ký tự!"
            });
            return;
        }

        if (!values.name || values.name.length < 2) {
            notification.error({
                message: "Error Update Product",
                description: "Tên sản phẩm phải có ít nhất 2 ký tự!"
            });
            return;
        }

        if (values.price < 0) {
            notification.error({
                message: "Error Update Product",
                description: "Giá tiền phải lớn hơn hoặc bằng 0!"
            });
            return;
        }

        if (values.quantity < 0) {
            notification.error({
                message: "Error Update Product",
                description: "Số lượng phải lớn hơn hoặc bằng 0!"
            });
            return;
        }

        if (dayjs(values.manufacturingDate) >= dayjs(values.expirationDate)) {
            notification.error({
                message: "Error Update Product",
                description: "Ngày sản xuất phải nhỏ hơn ngày hết hạn!"
            });
            return;
        }

        if (!values.image) {
            notification.error({
                message: "Error Update Product",
                description: "Vui lòng nhập link ảnh sản phẩm!"
            });
            return;
        }

        const resProduct = await updateProductAPI(
            values.id,
            values.barCode || "",
            values.name || "",
            Number(values.price),
            Number(values.quantity),
            values.manufacturingDate ? dayjs(values.manufacturingDate).format("YYYY-MM-DD") : null,
            values.expirationDate ? dayjs(values.expirationDate).format("YYYY-MM-DD") : null,
            values.image
        );

        if (resProduct.data) {
            resetAndCloseModal();
            await loadProduct();
            notification.success({
                message: "Update Product",
                description: "Cập nhật Product thành công",
            });
        } else {
            notification.error({
                message: "Error Update Product",
                description: JSON.stringify(resProduct.message),
            });
        }
    };

    const resetAndCloseModal = () => {
        form.resetFields();
        setDataUpdate(null);
        setIsModalUpdateOpen(false);
    };

    return (
        <Modal
            title="Update Product"
            open={isModalUpdateOpen}
            onOk={() => form.submit()}
            onCancel={() => resetAndCloseModal()}
            maskClosable={false}
            okText={"UPDATE"}
        >
            <Form form={form} onFinish={handleSubmitBtn} layout="vertical">
                <Form.Item label="Id" name="id">
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    label="Mã BarCode"
                    name="barCode"
                    rules={[
                        { required: true, message: "Vui lòng nhập mã BarCode!" },
                        { min: 5, message: "Mã BarCode phải có ít nhất 5 ký tự!" },
                    ]}
                >
                    <Input placeholder="Nhập mã BarCode" />
                </Form.Item>
                <Form.Item
                    label="Tên Sản Phẩm"
                    name="name"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                        { min: 2, message: "Tên sản phẩm phải có ít nhất 2 ký tự!" },
                    ]}
                >
                    <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>
                <Form.Item
                    label="Giá tiền"
                    name="price"
                    rules={[
                        { required: true, message: "Vui lòng nhập giá tiền!" },
                        { type: "number", min: 0, message: "Giá tiền phải lớn hơn hoặc bằng 0!" },
                    ]}
                >
                    <InputNumber style={{ width: "100%" }} addonAfter={" đ"} />
                </Form.Item>
                <Form.Item
                    label="Số lượng"
                    name="quantity"
                    rules={[
                        { required: true, message: "Vui lòng nhập số lượng!" },
                        { type: "number", min: 0, message: "Số lượng phải lớn hơn hoặc bằng 0!" },
                    ]}
                >
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    label="Ngày Sản Xuất"
                    name="manufacturingDate"
                    rules={[{ required: true, message: "Vui lòng chọn ngày sản xuất!" }]}
                >
                    <Input type="date" placeholder="Chọn ngày sản xuất" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    label="Ngày Hết Hạn"
                    name="expirationDate"
                    rules={[
                        { required: true, message: "Vui lòng chọn ngày hết hạn!" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || !getFieldValue("manufacturingDate")) {
                                    return Promise.resolve();
                                }
                                if (dayjs(value).isAfter(dayjs(getFieldValue("manufacturingDate")))) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Ngày hết hạn phải sau ngày sản xuất!"));
                            },
                        }),
                    ]}
                >
                    <Input type="date" placeholder="Chọn ngày hết hạn" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    label="Link Ảnh Sản Phẩm"
                    name="image"
                    rules={[{ required: true, message: "Vui lòng nhập link ảnh sản phẩm!" }]}
                >
                    <Input placeholder="Nhập link ảnh sản phẩm" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateProductUnControl;