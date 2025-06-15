import {
    DollarCircleOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Card, Space, Statistic, Table, Typography, Select, notification } from "antd";
import { useEffect, useState, useContext, useCallback, useRef } from "react";
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
import { fetchAppUsersAPI } from "../../services/api.appUser";
import "./home.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Hàm tính số tuần trong năm
const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
};

function Home() {
    const [resumesCount, setResumesCount] = useState(0);
    const [inventory, setInventory] = useState(0);
    const [customers, setCustomers] = useState(0);
    const [totalResumePrice, setTotalResumePrice] = useState(0);
    const [resumeTimePeriod, setResumeTimePeriod] = useState("all");
    const { user } = useContext(AuthContext);
    const [refreshTrigger, setRefreshTrigger] = useState(new Date());
    const lastDateRef = useRef(new Date().toLocaleDateString('vi-VN')); // Track the last date

    // Memoized fetch function to avoid recreating on every render
    const fetchData = useCallback(async () => {
        if (!user || !user._id) {
            setResumesCount(null);
            setInventory(null);
            setCustomers(null);
            setTotalResumePrice(null);
            return;
        }

        try {
            const [resumeRes, productRes, appUsersRes] = await Promise.all([
                fetchResumeListAPI(1, 1000),
                fetchAllProductAPI(),
                fetchAppUsersAPI(1, 1000),
            ]);

            const resumeList = resumeRes.data?.result || [];
            setResumesCount(resumeRes.data?.meta?.total || 0);

            let total = 0;
            const currentDate = new Date(); // Use real-time date

            if (resumeTimePeriod === "all") {
                total = resumeList.reduce((sum, resume) => sum + (resume.totalPrice || 0), 0);
            } else if (resumeTimePeriod === "day") {
                total = resumeList.reduce((sum, resume) => {
                    const resumeDate = new Date(resume.transactionDate || resume.createdAt || new Date()).toLocaleDateString('vi-VN');
                    if (resumeDate === currentDate.toLocaleDateString('vi-VN')) {
                        return sum + (resume.totalPrice || 0);
                    }
                    return sum;
                }, 0);
            } else if (resumeTimePeriod === "week") {
                const currentWeek = getWeekNumber(currentDate);
                total = resumeList.reduce((sum, resume) => {
                    const resumeWeek = getWeekNumber(resume.transactionDate || resume.createdAt || new Date());
                    if (resumeWeek === currentWeek) {
                        return sum + (resume.totalPrice || 0);
                    }
                    return sum;
                }, 0);
            } else if (resumeTimePeriod === "month") {
                total = resumeList.reduce((sum, resume) => {
                    const resumeDate = new Date(resume.transactionDate || resume.createdAt || new Date());
                    const resumeMonthYear = `${resumeDate.toLocaleString('vi-VN', { month: 'long' })} ${resumeDate.getFullYear()}`;
                    const currentMonthYear = `${currentDate.toLocaleString('vi-VN', { month: 'long' })} ${currentDate.getFullYear()}`;
                    if (resumeMonthYear === currentMonthYear) {
                        return sum + (resume.totalPrice || 0);
                    }
                    return sum;
                }, 0);
            } else if (resumeTimePeriod === "year") {
                total = resumeList.reduce((sum, resume) => {
                    const resumeYear = new Date(resume.transactionDate || resume.createdAt || new Date()).getFullYear();
                    if (resumeYear === currentDate.getFullYear()) {
                        return sum + (resume.totalPrice || 0);
                    }
                    return sum;
                }, 0);
            }
            setTotalResumePrice(total);
            setInventory(productRes.data?.meta?.total || 0);
            setCustomers(appUsersRes.data?.meta?.total || 0);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: "Không thể lấy dữ liệu. Vui lòng kiểm tra API.",
            });
            setResumesCount(0);
            setTotalResumePrice(0);
            setInventory(0);
            setCustomers(0);
        }
    }, [user, resumeTimePeriod, refreshTrigger]);

    // Fetch data initially and on refresh
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Check for date change and trigger refresh
    useEffect(() => {
        const checkDateChange = () => {
            const currentDate = new Date();
            const currentDateStr = currentDate.toLocaleDateString('vi-VN');
            if (currentDateStr !== lastDateRef.current) {
                lastDateRef.current = currentDateStr;
                setRefreshTrigger(new Date()); // Trigger refresh on date change
            }
        };

        // Check every minute for a date change
        const interval = setInterval(checkDateChange, 60 * 1000); // Check every 60 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <div className="dashboard-container">
            <div className="space-y-5">
                <div className="dashboard-stats">
                    <DashboardCard
                        icon={<ShoppingCartOutlined className="anticon-shopping-cart" />}
                        title={"Resumes"}
                        value={resumesCount}
                    />
                    <DashboardCard
                        icon={<ShoppingOutlined className="anticon-shopping" />}
                        title={"Products"}
                        value={inventory}
                    />
                    <DashboardCard
                        icon={<UserOutlined className="anticon-user" />}
                        title={"Customers"}
                        value={customers}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Select
                            value={resumeTimePeriod}
                            onChange={setResumeTimePeriod}
                            style={{ width: "200px" }}
                        >
                            <Select.Option value="all">Tổng cộng</Select.Option>
                            <Select.Option value="day">Ngày</Select.Option>
                            <Select.Option value="week">Tuần</Select.Option>
                            <Select.Option value="month">Tháng</Select.Option>
                            <Select.Option value="year">Năm</Select.Option>
                        </Select>
                        <DashboardCard
                            icon={<DollarCircleOutlined className="anticon-dollar-circle" />}
                            title={"Tổng tiền (Resume)"}
                            value={totalResumePrice}
                        />
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="charts-container">
                        <div className="chart">
                            <DashboardChart user={user} />
                        </div>
                        <div className="chart">
                            <NewUsersChart user={user} />
                        </div>
                    </div>
                    <div className="tables-container">
                        <div className="recent-orders">
                            <ExpiringProducts user={user} />
                        </div>
                    </div>
                </div>
            </div>
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
                const currentDate = new Date(); // Use real-time date
                const thresholdDate = new Date(currentDate);
                thresholdDate.setDate(currentDate.getDate() + 7);

                const expiringData = products
                    .filter((product) => {
                        if (!product.expirationDate) return false;
                        const date = new Date(product.expirationDate);
                        return date >= currentDate && date <= thresholdDate;
                    })
                    .map((item, index) => ({
                        ...item,
                        key: item._id || index,
                        expirationDate: new Date(item.expirationDate).toISOString().split('T')[0],
                    }));

                setDataSource(expiringData);
                setLoading(false);
            }).catch((err) => {
                setDataSource([]);
                setLoading(false);
                notification.error({
                    message: "Error",
                    description: "Cannot fetch product data. Please check the API.",
                });
            });
        }
    }, [user]);

    return (
        <>
            <Typography.Title level={5}>Sản phẩm sắp hết hạn</Typography.Title>
            <Table
                columns={[
                    { title: "Tên", dataIndex: "name" },
                    { title: "Mã vạch", dataIndex: "barCode" },
                    { title: "Số lượng", dataIndex: "quantity" },
                    { title: "Giá", dataIndex: "price" },
                    { title: "Ngày hết hạn", dataIndex: "expirationDate" },
                ]}
                loading={loading}
                dataSource={dataSource}
                pagination={false}
                scroll={{ x: "max-content" }}
            />
        </>
    );
}

function TopProducts({ user }) {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(null);
    const [monthOptions, setMonthOptions] = useState([]);

    // Generate month options up to the current month
    const getMonthOptions = () => {
        const now = new Date(); // Use real-time date
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 0-based, so +1

        return Array.from({ length: currentMonth }, (_, i) => ({
            value: i + 1,
            label: `${i + 1}/${currentYear}`,
        }));
    };

    useEffect(() => {
        if (!user || !user._id) {
            setDataSource([]);
            setMonthOptions([]);
        } else {
            setLoading(true);
            fetchAllProductAPI()
                .then((res) => {
                    const products = res.data?.result || [];
                    const months = getMonthOptions();
                    setMonthOptions(months);

                    const now = new Date(); // Use real-time date
                    const defaultMonth = `${now.getMonth() + 1}/${now.getFullYear()}`;
                    setMonth(month || defaultMonth);

                    // Group products by month and filter by selected month
                    const monthlyData = products.reduce((acc, product) => {
                        const date = new Date(product.transactionDate || product.createdAt || new Date());
                        const m = date.getMonth() + 1; // 0-based, so +1
                        const y = date.getFullYear();
                        const monthYear = `${m}/${y}`;
                        if (!acc[monthYear]) {
                            acc[monthYear] = [];
                        }
                        acc[monthYear].push({
                            ...product,
                            key: product._id || `${product.name}-${monthYear}`,
                            monthYear,
                            sold: product.sold || 0,
                        });
                        return acc;
                    }, {});

                    // Filter by selected month and get top 5
                    const filteredData = month
                        ? monthlyData[month]
                            ?.sort((a, b) => b.sold - a.sold)
                            .slice(0, 5) || []
                        : [];

                    setDataSource(filteredData);
                    setLoading(false);
                })
                .catch((err) => {
                    setDataSource([]);
                    setMonthOptions([]);
                    setLoading(false);
                    notification.error({
                        message: "Error",
                        description: "Cannot fetch product data. Please check the API.",
                    });
                });
        }
    }, [user, month]);

    return (
        <>
            <Typography.Title level={5}>Sản phẩm bán chạy nhất theo tháng</Typography.Title>
            <Select
                value={month}
                onChange={setMonth}
                style={{ width: "200px", marginBottom: "16px" }}
                placeholder="Chọn tháng"
            >
                {monthOptions.map((m) => (
                    <Select.Option key={m.value} value={m.label}>
                        {m.label}
                    </Select.Option>
                ))}
            </Select>
            <Table
                columns={[
                    { title: "Tên sản phẩm", dataIndex: "name" },
                    { title: "Mã vạch", dataIndex: "barCode" },
                    { title: "Số lượng bán", dataIndex: "sold" },
                    { title: "Tháng", dataIndex: "monthYear" },
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
        if (!user || !user._id) {
            setRevenueData({ labels: [], datasets: [] });
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
                        const bankingDailyData = bankingTransactions.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate).toLocaleDateString('vi-VN');
                            const revenue = (curr.amountIn || 0) - (curr.amountOut || 0);
                            acc[date] = (acc[date] || 0) + revenue;
                            return acc;
                        }, {});
                        bankingLabels = Object.keys(bankingDailyData);
                        bankingData = Object.values(bankingDailyData);

                        const resumeDailyData = resumeList.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate || curr.createdAt || new Date()).toLocaleDateString('vi-VN');
                            const revenue = curr.totalPrice || 0;
                            acc[date] = (acc[date] || 0) + revenue;
                            return acc;
                        }, {});
                        resumeLabels = Object.keys(resumeDailyData);
                        resumeData = Object.values(resumeDailyData);
                    } else if (timePeriod === "week") {
                        const bankingWeeklyData = bankingTransactions.reduce((acc, curr) => {
                            const week = getWeekNumber(curr.transactionDate);
                            const revenue = (curr.amountIn || 0) - (curr.amountOut || 0);
                            acc[week] = (acc[week] || 0) + revenue;
                            return acc;
                        }, {});
                        bankingLabels = Object.keys(bankingWeeklyData);
                        bankingData = Object.values(bankingWeeklyData);

                        const resumeWeeklyData = resumeList.reduce((acc, curr) => {
                            const week = getWeekNumber(curr.transactionDate || curr.createdAt || new Date());
                            const revenue = curr.totalPrice || 0;
                            acc[week] = (acc[week] || 0) + revenue;
                            return acc;
                        }, {});
                        resumeLabels = Object.keys(resumeWeeklyData);
                        resumeData = Object.values(resumeWeeklyData);
                    } else if (timePeriod === "month") {
                        const bankingMonthlyData = bankingTransactions.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate);
                            const monthYear = `${date.toLocaleString('vi-VN', { month: 'long' })} ${date.getFullYear()}`;
                            const revenue = (curr.amountIn || 0) - (curr.amountOut || 0);
                            acc[monthYear] = (acc[monthYear] || 0) + revenue;
                            return acc;
                        }, {});
                        bankingLabels = Object.keys(bankingMonthlyData);
                        bankingData = Object.values(bankingMonthlyData);

                        const resumeMonthlyData = resumeList.reduce((acc, curr) => {
                            const date = new Date(curr.transactionDate || curr.createdAt || new Date());
                            const monthYear = `${date.toLocaleString('vi-VN', { month: 'long' })} ${date.getFullYear()}`;
                            const revenue = curr.totalPrice || 0;
                            acc[monthYear] = (acc[monthYear] || 0) + revenue;
                            return acc;
                        }, {});
                        resumeLabels = Object.keys(resumeMonthlyData);
                        resumeData = Object.values(resumeMonthlyData);
                    } else if (timePeriod === "year") {
                        const bankingYearlyData = bankingTransactions.reduce((acc, curr) => {
                            const year = new Date(curr.transactionDate).getFullYear();
                            const revenue = (curr.amountIn || 0) - (curr.amountOut || 0);
                            acc[year] = (acc[year] || 0) + revenue;
                            return acc;
                        }, {});
                        bankingLabels = Object.keys(bankingYearlyData).map(year => `${year}`);
                        bankingData = Object.values(bankingYearlyData);

                        const resumeYearlyData = resumeList.reduce((acc, curr) => {
                            const year = new Date(curr.transactionDate || curr.createdAt || new Date()).getFullYear();
                            const revenue = curr.totalPrice || 0;
                            acc[year] = (acc[year] || 0) + revenue;
                            return acc;
                        }, {});
                        resumeLabels = Object.keys(resumeYearlyData).map(year => `${year}`);
                        resumeData = Object.values(resumeYearlyData);
                    }

                    const allLabels = [...new Set([...bankingLabels, ...resumeLabels])].sort();

                    setRevenueData({
                        labels: allLabels,
                        datasets: [
                            {
                                label: "Doanh thu (Banking)",
                                data: allLabels.map(label => bankingData[bankingLabels.indexOf(label)] || 0),
                                backgroundColor: "rgba(54, 162, 235, 0.8)",
                            },
                            {
                                label: "Doanh thu (Resumes)",
                                data: allLabels.map(label => resumeData[resumeLabels.indexOf(label)] || 0),
                                backgroundColor: "rgba(255, 99, 132, 0.8)",
                            },
                        ],
                    });
                } catch (error) {
                    notification.error({
                        message: "Error",
                        description: "Cannot fetch revenue data. Please check the API.",
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
                    <Select.Option value="day">Ngày</Select.Option>
                    <Select.Option value="week">Tuần</Select.Option>
                    <Select.Option value="month">Tháng</Select.Option>
                    <Select.Option value="year">Năm</Select.Option>
                </Select>
            </div>
            <div className="chart-wrapper">
                <Bar options={options} data={revenueData} />
            </div>
        </Card>
    );
}

function NewUsersChart({ user }) {
    const [newUsersData, setNewUsersData] = useState({ labels: [], datasets: [] });
    const [usersTimePeriod, setUsersTimePeriod] = useState("day");

    useEffect(() => {
        if (!user || !user._id) {
            setNewUsersData({ labels: [], datasets: [] });
            return;
        }

        const fetchData = async () => {
            try {
                const res = await fetchAppUsersAPI(1, 1000);
                const users = res.data?.result || [];

                if (!Array.isArray(users) || users.length === 0) {
                    setNewUsersData({ labels: [], datasets: [] });
                    return;
                }

                let labels = [];
                let data = [];

                const now = new Date(); // Use real-time date

                if (usersTimePeriod === "day") {
                    const dailyData = users.reduce((acc, curr) => {
                        const createdDate = new Date(curr.createdAt || new Date()).toLocaleDateString('vi-VN');
                        acc[createdDate] = (acc[createdDate] || 0) + 1;
                        return acc;
                    }, {});
                    labels = Object.keys(dailyData);
                    data = Object.values(dailyData);
                } else if (usersTimePeriod === "week") {
                    const weeklyData = users.reduce((acc, curr) => {
                        const week = getWeekNumber(curr.createdAt || new Date());
                        acc[week] = (acc[week] || 0) + 1;
                        return acc;
                    }, {});
                    labels = Object.keys(weeklyData);
                    data = Object.values(weeklyData);
                } else if (usersTimePeriod === "month") {
                    const monthlyData = users.reduce((acc, curr) => {
                        const date = new Date(curr.createdAt || new Date());
                        const monthYear = `${date.toLocaleString('vi-VN', { month: 'long' })} ${date.getFullYear()}`;
                        acc[monthYear] = (acc[monthYear] || 0) + 1;
                        return acc;
                    }, {});
                    labels = Object.keys(monthlyData);
                    data = Object.values(monthlyData);
                } else if (usersTimePeriod === "year") {
                    const yearlyData = users.reduce((acc, curr) => {
                        const year = new Date(curr.createdAt || new Date()).getFullYear();
                        acc[year] = (acc[year] || 0) + 1;
                        return acc;
                    }, {});
                    labels = Object.keys(yearlyData).map(year => `${year}`);
                    data = Object.values(yearlyData);
                }

                setNewUsersData({
                    labels: labels.sort(),
                    datasets: [{
                        label: "Số lượng người dùng mới",
                        data: data,
                        backgroundColor: "rgba(75, 192, 192, 0.8)",
                    }],
                });
            } catch (error) {
                if (error.message && !error.message.includes("404") && !error.message.includes("500")) {
                    notification.error({
                        message: "Error",
                        description: "Cannot fetch user data. Please check the API.",
                    });
                }
                setNewUsersData({ labels: [], datasets: [] });
            }
        };
        fetchData();
    }, [user, usersTimePeriod]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "bottom" },
            title: { display: true, text: "Số lượng người dùng mới theo thời gian" },
        },
    };

    return (
        <Card className="chart-card">
            <div style={{ marginBottom: "16px" }}>
                <Select
                    value={usersTimePeriod}
                    onChange={setUsersTimePeriod}
                    style={{ width: "200px" }}
                >
                    <Select.Option value="day">Ngày</Select.Option>
                    <Select.Option value="week">Tuần</Select.Option>
                    <Select.Option value="month">Tháng</Select.Option>
                    <Select.Option value="year">Năm</Select.Option>
                </Select>
            </div>
            <div className="chart-wrapper">
                <Bar options={options} data={newUsersData} />
            </div>
        </Card>
    );
}

export default Home;