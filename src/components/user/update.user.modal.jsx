import { Input, Modal, notification } from "antd";
import { useEffect, useState } from "react";
import { updateUserApi } from "../../services/api.service";

const UpdateUserModal = (props) => {
    const [id, setId] = useState("");
    const [fullName, setFullName] = useState("");

    //const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    // console.log(">>> Check Props: ", props)
    const { isModalUpdateOpen, setIsModalUpdateOpen,
        dataUpdate, setDataUpdate,
        loadUser } = props;
    //if next dataUpdate != prev dataUpdate then
    useEffect(() => {
        // console.log(">>> Check dataUpdate props: ", dataUpdate)
        if (dataUpdate) {
            setId(dataUpdate._id);
            setFullName(dataUpdate.fullName);
            setPhone(dataUpdate.phone);
        }
    }, [dataUpdate])

    const handleSubmitBtn = async () => {
        const res = await updateUserApi(id, fullName, phone)
        // console.log(">>> Check Res: ", res);

        if (res.data) {
            notification.success({
                message: "Update A User",
                description: "Update A User thành công !!"
            })
            resetAndCloseModal();
            await loadUser();
        } else {
            notification.error({
                message: "Error Update A User",
                description: JSON.stringify(res.message)
            })
        }
    }

    const resetAndCloseModal = () => {
        setIsModalUpdateOpen(false);
        setId("");
        setFullName("");
        setPhone("");
        setDataUpdate(null);
    }



    return (
        <Modal
            title="Updata A User"
            open={isModalUpdateOpen}
            onOk={() => handleSubmitBtn()}
            onCancel={() => resetAndCloseModal()}
            maskClosable={false}
            okText={"SAVE"}
        >
            <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                <div>
                    <span>Id</span>
                    <Input
                        value={id}
                        disabled
                    />
                </div>
                <div>
                    <span>Full name</span>
                    <Input
                        value={fullName}
                        onChange={(event) => { setFullName(event.target.value) }}
                    />
                </div>
                <div>
                    <span>Phone</span>
                    <Input
                        value={phone}
                        onChange={(event) => { setPhone(event.target.value) }}
                    />
                </div>
            </div>
        </Modal>
    )
}

export default UpdateUserModal;