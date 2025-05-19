import { useState, useEffect, useRef } from "react";
import { Form, Input, InputNumber, Modal, notification, Button, Spin } from "antd";
import { BrowserMultiFormatReader } from "@zxing/library";
import dayjs from "dayjs";
import { handleUploadFile } from "../../services/api.service";
import { createProductAPI } from "../../services/api.product";

const ScanBarcodeModal = (props) => {
    const { isScanBarcodeOpen, setIsScanBarcodeOpen, loadProduct } = props;
    const [formScanBarcode] = Form.useForm();
    const [barcode, setBarcode] = useState("");
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false); // Thêm trạng thái loading
    const videoRef = useRef(null);
    const scannerRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // Khởi động camera và quét barcode
    const startScanning = async () => {
        try {
            setScanning(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            const codeReader = new BrowserMultiFormatReader();
            scannerRef.current = codeReader;

            codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
                if (result) {
                    setBarcode(result.getText());
                    formScanBarcode.setFieldsValue({ barCode: result.getText() });
                    stopScanning();
                }
                if (error && !error.message.includes("No MultiFormat Readers were able to detect the code")) {
                    console.error(error);
                }
            });
        } catch (error) {
            notification.error({
                message: "Lỗi truy cập camera",
                description: "Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.",
            });
            setScanning(false);
        }
    };

    // Dừng quét barcode và tắt camera
    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.reset();
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setScanning(false);
    };

    useEffect(() => {
        if (isScanBarcodeOpen && !barcode) {
            startScanning();
        }
        return () => {
            stopScanning();
        };
    }, [isScanBarcodeOpen]);

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

    const resetAndCloseModal = () => {
        formScanBarcode.resetFields();
        setBarcode("");
        setSelectedFile(null);
        setPreview(null);
        setIsScanBarcodeOpen(false);
        stopScanning();
    };

    const handleSubmitBtn = async (values) => {
        setLoading(true); // Bật trạng thái loading
        try {
            // Kiểm tra xem có file ảnh được chọn không
            if (!selectedFile) {
                notification.error({
                    message: "Error Upload File",
                    description: "Vui lòng upload ảnh sản phẩm!"
                });
                return;
            }

            // Upload file
            const resUpload = await handleUploadFile(selectedFile, "product");
            if (resUpload.data) {
                // Success
                const newImage = resUpload.data.fileUploaded;

                // Đảm bảo các giá trị là đúng định dạng
                const ProductData = {
                    image: newImage,
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
                };

                // Kiểm tra dữ liệu trước khi gửi
                if (ProductData.barCode.length < 5) {
                    notification.error({
                        message: "Error Create Product",
                        description: "Mã BarCode phải có ít nhất 5 ký tự!"
                    });
                    return;
                }

                if (ProductData.name.length < 2) {
                    notification.error({
                        message: "Error Create Product",
                        description: "Tên sản phẩm phải có ít nhất 2 ký tự!"
                    });
                    return;
                }

                if (dayjs(ProductData.manufacturingDate) >= dayjs(ProductData.expirationDate)) {
                    notification.error({
                        message: "Error Create Product",
                        description: "Ngày sản xuất phải nhỏ hơn ngày hết hạn!"
                    });
                    return;
                }

                // Gửi dữ liệu lên API
                const resProduct = await createProductAPI(ProductData);

                if (resProduct.data) {
                    resetAndCloseModal();
                    await loadProduct();
                    notification.success({
                        message: "Create Product!",
                        description: "Create Product success!"
                    });
                } else {
                    notification.error({
                        message: "Error Create Product!",
                        description: JSON.stringify(resProduct.message)
                    });
                }
            } else {
                notification.error({
                    message: "Error Upload File",
                    description: "Vui lòng upload ảnh"
                });
            }
        } catch (error) {
            notification.error({
                message: "Error",
                description: error.message || "Đã có lỗi xảy ra!"
            });
        } finally {
            setLoading(false); // Tắt trạng thái loading
        }
    };

    return (
        <Modal
            title="Thêm Sản Phẩm Bằng Barcode"
            open={isScanBarcodeOpen}
            onOk={() => formScanBarcode.submit()}
            onCancel={resetAndCloseModal}
            maskClosable={false}
            okText={"TẠO"}
            confirmLoading={loading} // Hiển thị loading trên nút "TẠO"
        >
            <div style={{ marginBottom: 20 }}>
                {scanning ? (
                    <div>
                        <video ref={videoRef} style={{ width: "100%", height: "auto" }} />
                        <Button
                            onClick={stopScanning}
                            style={{ marginTop: 10 }}
                            danger
                        >
                            Dừng Quét
                        </Button>
                    </div>
                ) : barcode ? (
                    <p>Mã Barcode: <strong>{barcode}</strong></p>
                ) : (
                    <p>Không tìm thấy mã barcode. Vui lòng thử lại.</p>
                )}
                {barcode && (
                    <Button onClick={startScanning} style={{ marginTop: 10 }}>
                        Quét lại Barcode
                    </Button>
                )}
            </div>

            <Form
                form={formScanBarcode}
                onFinish={handleSubmitBtn}
                layout="vertical"
            >
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <Form.Item
                        label="Mã BarCode"
                        name="barCode"
                        rules={[
                            { required: true, message: "Vui lòng nhập mã barCode!" },
                            { min: 5, message: "Mã BarCode phải có ít nhất 5 ký tự!" }
                        ]}
                    >
                        <Input placeholder="Mã barCode" disabled value={barcode} />
                    </Form.Item>
                    <Form.Item
                        label="Tên Sản Phẩm"
                        name="name"
                        rules={[
                            { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                            { min: 2, message: "Tên sản phẩm phải có ít nhất 2 ký tự!" }
                        ]}
                    >
                        <Input placeholder="Nhập tên sản phẩm" />
                    </Form.Item>
                    <Form.Item
                        label="Giá"
                        name="price"
                        rules={[
                            { required: true, message: "Vui lòng nhập giá sản phẩm!" },
                            { type: "number", min: 0, message: "Giá phải lớn hơn hoặc bằng 0!" }
                        ]}
                    >
                        <InputNumber
                            placeholder="Nhập giá sản phẩm"
                            style={{ width: "100%" }}
                            min={0}
                            addonAfter={"đ"}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Số Lượng"
                        name="quantity"
                        rules={[
                            { required: true, message: "Vui lòng nhập số lượng tồn kho!" },
                            { type: "number", min: 0, message: "Số lượng phải lớn hơn hoặc bằng 0!" }
                        ]}
                    >
                        <InputNumber
                            placeholder="Nhập số lượng"
                            style={{ width: "100%" }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Ngày Sản Xuất"
                        name="manufacturingDate"
                        rules={[{ required: true, message: "Vui lòng chọn ngày sản xuất!" }]}
                    >
                        <Input
                            type="date"
                            placeholder="Chọn ngày sản xuất"
                            style={{ width: "100%" }}
                        />
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
                        <Input
                            type="date"
                            placeholder="Chọn ngày hết hạn"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                    <div>
                        <div>Ảnh Sản Phẩm</div>
                        <div>
                            <label
                                htmlFor="btnUploadScan"
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
                                id="btnUploadScan"
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
                                    alt="Preview"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default ScanBarcodeModal;