import React, { useState } from 'react';
import { Button, Drawer, Modal, notification } from 'antd';
import { handleUploadFile, updateUserAvatarApi } from '../../services/api.service';

const ViewUserDetail = (props) => {
    const {
        dataDetail, setDataDetail,
        isDetailOpen, setIsDetailOpen, loadUser
    } = props;

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        //console.log("Check event: ", preview)
    };

    const handleUpdateUserAvatar = async () => {
        const resUpload = await handleUploadFile(selectedFile, "avatar");
        if (resUpload.data) {
            const newAvatar = resUpload.data.fileUploaded;
            const resUpdateAvatar = await updateUserAvatarApi(
                newAvatar,
                dataDetail._id,
                dataDetail.fullName,
                dataDetail.phone
            );
            if (resUpdateAvatar.data) {
                setIsDetailOpen(false);
                setSelectedFile(null);
                setPreview(null);
                await loadUser();
                notification.success({
                    message: "Update User Avatar",
                    description: "Cập nhật Avatar thành công !"
                });
            } else {
                notification.error({
                    message: "Error Update File",
                    description: JSON.stringify(resUpdateAvatar.message)
                });
            }
        } else {
            notification.error({
                message: "Error Upload File",
                description: JSON.stringify(resUpload.message)
            });
        }
    };

    return (
        <>
            <Drawer
                width={"35vw"}
                title={<div style={{ textAlign: "center", width: "100%" }}>Information Detail User</div>}
                onClose={() => {
                    setDataDetail(null);
                    setIsDetailOpen(false);
                    setSelectedFile(null);
                    setPreview(null);
                }}
                open={isDetailOpen}
            >
                {dataDetail ? (
                    <div style={{ padding: "10px", textAlign: "center" }}>
                        <p><strong>Id:</strong> {dataDetail._id}</p>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "15px" }}>
                            <br />
                            {preview ? (
                                <>
                                    <img
                                        src={preview}
                                        alt="New Avatar Preview"
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            objectFit: "cover",
                                            borderRadius: "50%",
                                            cursor: "pointer",
                                            border: "3px solid #007BFF",
                                            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                                            marginTop: "10px"
                                        }}
                                    />
                                    <div style={{ marginTop: "10px" }}>
                                        <Button type='primary' onClick={() => handleUpdateUserAvatar()} style={{ marginRight: "10px" }}>Save</Button>
                                        <Button type='default' onClick={() => { setSelectedFile(null); setPreview(null); }}>Cancel</Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <img
                                        src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${dataDetail.avatar}`}
                                        alt="User Avatar"
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            objectFit: "cover",
                                            borderRadius: "50%",
                                            cursor: "pointer",
                                            border: "3px solid #007BFF",
                                            boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                                        }}
                                        onClick={() => setIsModalOpen(true)}
                                    />
                                    <label htmlFor='btnUpload' style={{
                                        display: "block",
                                        marginTop: "12px",
                                        padding: "10px 15px",
                                        background: "linear-gradient(135deg, #007BFF, #00BFFF)",
                                        color: "white",
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        borderRadius: "25px",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 3px 6px rgba(0,0,0,0.15)"
                                    }}>
                                        Upload Avatar
                                    </label>
                                    <input type='file' hidden id='btnUpload' onChange={handleOnChangeFile} />
                                </>
                            )}
                        </div>
                        <div style={{ background: "#f9f9f9", borderRadius: "8px" }}>
                            <p><strong>Full Name:</strong> {dataDetail.fullName}</p>
                            <p><strong>Role:</strong> {dataDetail.role}</p>
                            <p><strong>Email:</strong> {dataDetail.email}</p>
                            <p><strong>Phone:</strong> {dataDetail.phone}</p>
                        </div>
                    </div>
                ) : (
                    <p style={{ textAlign: "center" }}>No Information</p>
                )}
            </Drawer>
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
            >
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img
                        src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${dataDetail?.avatar}`}
                        alt="User Avatar Large"
                        style={{
                            width: "80%",
                            maxHeight: "80vh",
                            objectFit: "contain",
                            borderRadius: "10px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                        }}
                    />
                </div>
            </Modal>
        </>
    );
};

export default ViewUserDetail;