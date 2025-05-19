// src/components/home/Home.jsx
import {
    DollarCircleOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Card, Space, Statistic, Table, Typography, Select, notification } from "antd";
import { useEffect, useState, useContext } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { fetchAllUserAPI } from "../../services/api.service";
import { fetchAllProductAPI } from "../../services/api.product";
import { fetchResumeListAPI } from "../../services/api.resume";
import { fetchTransactionListAPI } from "../../services/api.banking";
import { AuthContext } from "../context/auth.context";
import "./home.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function Home() {
    const [resumesCount, setResumesCount] = useState(0);
    const [inventory, setInventory] = useState(0);
    const [customers, setCustomers] = useState(0);
    const [totalResumePrice, setTotalResumePrice] = useState(0);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user || !user._id) {
            setResumesCount(null);
            setInventory(null);
            setCustomers(null);
            setTotalResumePrice(null);
        } else {
            fetchResumeListAPI(1, 1000).then((res) => {
                const resumeList = res.data?.result || [];
                setResumesCount(res.data?.meta?.total || 0);
                const total = resumeList.reduce((sum, resume) => sum + (resume.totalPrice || 0), 0);
                setTotalResumePrice(total);
            });
            fetchAllProductAPI().then((res) => {
                setInventory(res.data?.meta?.total || 0);
            });
            fetchAllUserAPI().then((res) => {
                setCustomers(res.data?.meta?.total || 0);
            });
        }
    }, [user]);

    return (
        <div className="dashboard-container">
            <Space size={20} direction="vertical" style={{ width: "100%" }}>
                <div className="dashboard-stats">
                    <DashboardCard
                        icon={<ShoppingCartOutlined className="icon orders-icon" />}
                        title={"Resumes"}
                        value={resumesCount}
                    />
                    <DashboardCard
                        icon={<ShoppingOutlined className="icon inventory-icon" />}
                        title={"Inventory"}
                        value={inventory}
                    />
                    <DashboardCard
                        icon={<UserOutlined className="icon customer-icon" />}
                        title={"Customer"}
                        value={customers}
                    />
                    <DashboardCard
                        icon={<DollarCircleOutlined className="icon revenue-icon" />}
                        title={"Tổng tiền (Resume)"}
                        value={totalResumePrice}
                    />
                </div>

                <div className="dashboard-content">
                    <div className="recent-orders">
                        <ExpiringProducts user={user} />
                    </div>
                    <div className="chart">
                        <DashboardChart user={user} />
                    </div>
                </div>
            </Space>
        </div>
    );
}

function DashboardCard({ title, value, icon }) {
    return (
        <Card className="dashboard-card">
            <Space direction="horizontal">
                {icon}
                <Statistic title={title} value={value} />
            </Space>
        </Card>
    );
}

function ExpiringProducts({ user }) {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !user._id) {
            setDataSource([]);
        } else {
            setLoading(true);
            fetchAllProductAPI().then((res) => {
                const products = res.data?.result || [];
                const currentDate = new Date("2025-05-19"); // Ngày hiện tại
                const thresholdDate = new Date(currentDate);
                thresholdDate.setDate(currentDate.getDate() + 7);

                const expiringProducts = products
                    .filter((product) => {
                        if (!product.expirationDate) return false;
                        const expirationDate = new Date(product.expirationDate);
                        return expirationDate >= currentDate && expirationDate <= thresholdDate;
                    })
                    .map((product, index) => ({
                        ...product,
                        key: product._id || index,
                        expirationDate: new Date(product.expirationDate).toISOString().split('T')[0],
                    }));

                setDataSource(expiringProducts);
                setLoading(false);
            }).catch((error) => {
                console.error("Error fetching products:", error);
                setDataSource([]);
                setLoading(false);
                notification.error({
                    message: "Lỗi",
                    description: "Không thể lấy dữ liệu sản phẩm. Vui lòng kiểm tra API.",
                });
            });
        }
    }, [user]);

    return (
        <>
            <Typography.Title level={5}>Product sắp hết hạn sử dụng</Typography.Title>
            <Table
                columns={[
                    { title: "Title", dataIndex: "mainText" },
                    { title: "Name", dataIndex: "name" },
                    { title: "Barcode", dataIndex: "barCode" },
                    { title: "Quantity", dataIndex: "quantity" },
                    { title: "Price", dataIndex: "price" },
                    { title: "Expiration Date", dataIndex: "expirationDate" },
                ]}
                loading={loading}
                dataSource={dataSource}
                pagination={false}
                scroll={{ x: "max-content" }}
            />
        </>
    );
}

function DashboardChart({ user }) {
    const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
    const [timePeriod, setTimePeriod] = useState("day");

    useEffect(() => {
        console.log("User changed in DashboardChart:", user);
        if (!user || !user._id) {
            setRevenueData({ labels: [], datasets: [] });
            console.log("Reset revenueData to empty:", { labels: [], datasets: [] });
        } else {
            const fetchData = async () => {
                try {
                    const [bankingRes, resumeRes] = await Promise.all([
                        fetchTransactionListAPI(),
                        fetchResumeListAPI(1, 1000),
                    ]);

                    const bankingTransactions = bankingRes.data || [];
                    const resumeList = resumeRes.data?.result || [];

                    let bankingLabels = [];
                    let bankingData = [];
                    let resumeLabels = [];
                    let resumeData = [];

                    if (timePeriod === "day") {
                        // Tính doanh thu Banking theo ngày
                        const bankingDailyData = bankingTransactions.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate).toLocaleDateString('vi-VN');
                            const revenue = (curr.amountIn || 0) - (curr.amountOut || 0);
                            acc[date] = (acc[date] || 0) + revenue;
                            return acc;
                        }, {});
                        bankingLabels = Object.keys(bankingDailyData);
                        bankingData = Object.values(bankingDailyData);

                        // Tính doanh thu Resumes theo ngày
                        const resumeDailyData = resumeList.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate || curr.createdAt || "2025-05-19").toLocaleDateString('vi-VN');
                            const revenue = curr.totalPrice || 0;
                            acc[date] = (acc[date] || 0) + revenue;
                            return acc;
                        }, {});
                        resumeLabels = Object.keys(resumeDailyData);
                        resumeData = Object.values(resumeDailyData);
                    } else if (timePeriod === "month") {
                        // Tính doanh thu Banking theo tháng
                        const bankingMonthlyData = bankingTransactions.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate);
                            const monthYear = `${date.toLocaleString('vi-VN', { month: 'long' })} ${date.getFullYear()}`;
                            const revenue = (curr.amountIn || 0) - (curr.amountOut || 0);
                            acc[monthYear] = (acc[monthYear] || 0) + revenue;
                            return acc;
                        }, {});
                        bankingLabels = Object.keys(bankingMonthlyData);
                        bankingData = Object.values(bankingMonthlyData);

                        // Tính doanh thu Resumes theo tháng
                        const resumeMonthlyData = resumeList.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate || curr.createdAt || "2025-05-19");
                            const monthYear = `${date.toLocaleString('vi-VN', { month: 'long' })} ${date.getFullYear()}`;
                            const revenue = curr.totalPrice || 0;
                            acc[monthYear] = (acc[monthYear] || 0) + revenue;
                            return acc;
                        }, {});
                        resumeLabels = Object.keys(resumeMonthlyData);
                        resumeData = Object.values(resumeMonthlyData);
                    } else if (timePeriod === "year") {
                        // Tính doanh thu Banking theo năm
                        const bankingYearlyData = bankingTransactions.reduce((acc, curr) => {
                            const year = new Date(curr.transactionDate).getFullYear();
                            const revenue = (curr.amountIn || 0) - (curr.amountOut || 0);
                            acc[year] = (acc[year] || 0) + revenue;
                            return acc;
                        }, {});
                        bankingLabels = Object.keys(bankingYearlyData).map(year => `${year}`);
                        bankingData = Object.values(bankingYearlyData);

                        // Tính doanh thu Resumes theo năm
                        const resumeYearlyData = resumeList.reduce((acc, curr) => {
                            const year = new Date(curr.transactionDate || curr.createdAt || "2025-05-19").getFullYear();
                            const revenue = curr.totalPrice || 0;
                            acc[year] = (acc[year] || 0) + revenue;
                            return acc;
                        }, {});
                        resumeLabels = Object.keys(resumeYearlyData).map(year => `${year}`);
                        resumeData = Object.values(resumeYearlyData);
                    }

                    // Đảm bảo labels đồng nhất giữa Banking và Resumes
                    const allLabels = [...new Set([...bankingLabels, ...resumeLabels])].sort();

                    // Tạo datasets
                    setRevenueData({
                        labels: allLabels,
                        datasets: [
                            {
                                label: "Doanh thu (Banking)",
                                data: allLabels.map(label => bankingData[bankingLabels.indexOf(label)] || 0),
                                backgroundColor: "rgba(54, 162, 235, 0.8)", // Màu xanh dương
                            },
                            {
                                label: "Doanh thu (Resumes)",
                                data: allLabels.map(label => resumeData[resumeLabels.indexOf(label)] || 0),
                                backgroundColor: "rgba(255, 99, 132, 0.8)", // Màu đỏ
                            },
                        ],
                    });
                } catch (error) {
                    console.error("Error fetching data:", error);
                    notification.error({
                        message: "Lỗi",
                        description: "Không thể lấy dữ liệu doanh thu. Vui lòng kiểm tra API.",
                    });
                    setRevenueData({ labels: [], datasets: [] });
                }
            };
            fetchData();
        }
    }, [user, timePeriod]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "bottom" },
            title: { display: true, text: "Doanh thu Banking và Resumes theo thời gian" },
        },
    };

    return (
        <Card className="chart-card">
            <div style={{ marginBottom: "16px" }}>
                <Select
                    value={timePeriod}
                    onChange={setTimePeriod}
                    style={{ width: "200px" }}
                >
                    <Select.Option value="day">Theo ngày</Select.Option>
                    <Select.Option value="month">Theo tháng</Select.Option>
                    <Select.Option value="year">Theo năm</Select.Option>
                </Select>
            </div>
            <div className="chart-wrapper">
                <Bar options={options} data={revenueData} />
            </div>
        </Card>
    );
}

export default Home;