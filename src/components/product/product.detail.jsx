import { Drawer } from "antd";

const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const ProductDetail = (props) => {
    const {
        dataDetail, setDataDetail, isDetailOpen,
        setIsDetailOpen
    } = props;

    return (
        <Drawer
            width={"35vw"}
            title="Chi tiết sản phẩm"
            onClose={() => {
                setDataDetail(null);
                setIsDetailOpen(false);
            }}
            open={isDetailOpen}
        >
            {dataDetail ?
                <>
                    <p>Id: {dataDetail._id}</p>
                    <br />
                    <p>Mã BarCode: {dataDetail.barCode}</p>
                    <br />
                    <p>Tên sản phẩm: {dataDetail.name}</p>
                    <br />
                    <p>Giá tiền: {
                        new Intl.NumberFormat('vi-VN',
                            { style: 'currency', currency: 'VND' }).format(dataDetail.price)
                    }
                    </p>
                    <br />
                    <p>Số lượng: {dataDetail.quantity}</p>
                    <br />
                    <p>Đã bán: {dataDetail.sold || 0}</p>
                    <br />
                    <p>Ngày sản xuất: {formatDate(dataDetail.manufacturingDate)}</p>
                    <br />
                    <p>Hạn sử dụng: {formatDate(dataDetail.expirationDate)}</p>
                    <br />
                    <p>Image:</p>
                    <div style={{
                        marginTop: "10px",
                        height: "100px", width: "150px",
                        border: "1px solid #ccc"
                    }}>
                        <img
                            style={{ height: "100%", width: "100%", objectFit: "contain" }}
                            src={dataDetail.image}
                            alt="Product"
                            onError={(e) => (e.target.src = "https://via.placeholder.com/150")} // Fallback image
                        />
                    </div>
                </>
                :
                <>
                    <p>No Data</p>
                </>
            }
        </Drawer>
    );
};

export default ProductDetail;