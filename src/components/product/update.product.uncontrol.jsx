import { Form, Input, InputNumber, Modal, notification } from "antd";
import { useEffect, useState } from "react";
import { handleUploadFile } from "../../services/api.service";
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
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);

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
            });
            setPreview(`${import.meta.env.VITE_BACKEND_URL}/images/product/${dataUpdate.image}`);
        }
    }, [dataUpdate]);

    const handleSubmitBtn = async () => {
        // Lấy dữ liệu từ form
        const values = form.getFieldsValue();

        // Kiểm tra dữ liệu trước khi gửi
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

        // Kiểm tra ảnh thumbnail
        if (!selectedFile && !preview) {
            notification.error({
                message: "Error Update Product",
                description: "Vui lòng upload ảnh thumbnail!"
            });
            return;
        }

        let newImage = "";
        if (!selectedFile && preview) {
            newImage = dataUpdate.thumbnail || dataUpdate.image;
        } else {
            const resUpload = await handleUploadFile(selectedFile, "product");
            if (resUpload.data) {
                newImage = resUpload.data.fileUploaded;
            } else {
                notification.error({
                    message: "Error Upload File",
                    description: JSON.stringify(resUpload.message),
                });
                return;
            }
        }

        // Log dữ liệu trước khi gửi
        console.log("Data prepared for updateProductAPI:", {
            _id: values.id,
            barCode: values.barCode || "",
            name: values.name || "",
            price: Number(values.price),
            quantity: Number(values.quantity),
            manufacturingDate: values.manufacturingDate
                ? dayjs(values.manufacturingDate).format("YYYY-MM-DD")
                : null,
            expirationDate: values.expirationDate
                ? dayjs(values.expirationDate).format("YYYY-MM-DD")
                : null,
            image: newImage,
        });

        // Gửi dữ liệu dưới dạng các tham số riêng lẻ
        const resProduct = await updateProductAPI(
            values.id,
            values.barCode || "",
            values.name || "",
            Number(values.price),
            Number(values.quantity),
            values.manufacturingDate ? dayjs(values.manufacturingDate).format("YYYY-MM-DD") : null,
            values.expirationDate ? dayjs(values.expirationDate).format("YYYY-MM-DD") : null,
            newImage
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
        setSelectedFile(null);
        setPreview(null);
        setDataUpdate(null);
        setIsModalUpdateOpen(false);
    };

    const handleOnChangeFile = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            setSelectedFile(null);
            setPreview(null);
            return;
        }

        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
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
                <div style={{ display: "flex", flexDirection: "column" }}>
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

                    <div>
                        <div>Ảnh Thumbnail</div>
                        <div>
                            <label
                                htmlFor="btnUpload"
                                style={{
                                    display: "block",
                                    width: "fit-content",
                                    marginTop: "15px",
                                    padding: "5px 10px",
                                    background: "orange",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                Upload
                            </label>
                            <input
                                type="file"
                                hidden
                                id="btnUpload"
                                onChange={(event) => handleOnChangeFile(event)}
                                onClick={(event) => (event.target.value = null)}
                                style={{ display: "none" }}
                            />
                        </div>
                        {preview && (
                            <div
                                style={{
                                    marginTop: "10px",
                                    marginBottom: "15px",
                                    height: "100px",
                                    width: "150px",
                                }}
                            >
                                <img
                                    style={{ height: "100%", width: "100%", objectFit: "contain" }}
                                    src={preview}
                                    alt="Thumbnail Preview"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default UpdateProductUnControl;