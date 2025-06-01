import { useCallback, useEffect, useState } from "react";
import UserForm from "../components/user/user.form";
import UserTable from "../components/user/user.table";
import { fetchAllUserAPI } from "../services/api.service";

const UserPage = () => {
    const [dataUsers, setDataUsers] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loadingTable, setLoadingTable] = useState(false);

    const loadUser = useCallback(async () => {
        setLoadingTable(true)
        const res = await fetchAllUserAPI(current, pageSize)
        //console.log("Check res:", res)
        if (res.data) {
            setDataUsers(res.data.result);
            setCurrent(res.data.meta.current);
            setPageSize(res.data.meta.pageSize);
            setTotal(res.data.meta.total);
        }
        setLoadingTable(false)
    }, [current, pageSize])

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // console.log(">>>> Check current: ", current)
    // console.log(">>> Check pageSize: ", pageSize)
    // lift-up state
    return (
        <div>
            <UserForm loadUser={loadUser} />
            <UserTable
                dataUsers={dataUsers}
                loadUser={loadUser}
                current={current}
                pageSize={pageSize}
                total={total}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                loadingTable={loadingTable}
            />
        </div>
    )
}

export default UserPage;