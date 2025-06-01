import React, { useState, useEffect } from "react";
import { notification } from "antd";
import AppUser from "../components/appUser/AppUser";
import {
    fetchAppUsersAPI,

    updateAppUserAPI,
    deleteAppUserAPI,
    createAppUserAPI,
} from "../services/api.appUser";

const AppUserPage = () => {
    const [appUsers, setAppUsers] = useState([]);
    const [fullAppUsers, setFullAppUsers] = useState([]);
    const [totalAppUsers, setTotalAppUsers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    const fetchAppUsers = async (page = 1, size = pageSize) => {
        setLoading(true);
        try {
            const response = await fetchAppUsersAPI(page, size);
            const appUserList = Array.isArray(response?.data?.result) ? response.data.result : [];
            setAppUsers(appUserList);
            setTotalAppUsers(response?.data?.meta?.total || 0);

            const fullResponse = await fetchAppUsersAPI(1, 1000);
            const fullAppUserList = Array.isArray(fullResponse?.data?.result) ? fullResponse.data.result : [];
            setFullAppUsers(fullAppUserList);
        } catch (error) {
            console.error("Error fetching app users:", error);
            notification.error({
                message: "Lỗi",
                description: error.response?.data?.message || "Không thể lấy danh sách người dùng.",
            });
            setAppUsers([]);
            setFullAppUsers([]);
            setTotalAppUsers(0);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAppUser = async (values) => {
        setLoading(true);
        try {
            await createAppUserAPI(values);
            await fetchAppUsers(currentPage, pageSize);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAppUser = async (id, values) => {
        setLoading(true);
        try {
            await updateAppUserAPI(id, values);
            await fetchAppUsers(currentPage, pageSize);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAppUser = async (id) => {
        setLoading(true);
        try {
            await deleteAppUserAPI(id);
            await fetchAppUsers(currentPage, pageSize);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchAppUsers(currentPage, pageSize);
    };

    useEffect(() => {
        fetchAppUsers(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (current, size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    return (
        <div>
            <h2 className="app-user-title" style={{ color: "#1d39c4" }}>
                Danh Sách Người Dùng
            </h2>
            <AppUser
                appUsers={appUsers}
                fullAppUsers={fullAppUsers}
                loading={loading}
                currentPage={currentPage}
                pageSize={pageSize}
                totalAppUsers={totalAppUsers}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onCreateAppUser={handleCreateAppUser}
                onUpdateAppUser={handleUpdateAppUser}
                onDeleteAppUser={handleDeleteAppUser}
                onRefresh={handleRefresh}
            />
        </div>
    );
};

export default AppUserPage;