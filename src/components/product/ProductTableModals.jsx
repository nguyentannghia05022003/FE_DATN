import ProductDetail from "./product.detail";
import CreateProductUncontrolled from "./create.product.uncontrol";
import UpdateProductUnControl from "./update.product.uncontrol";
import ScanBarcodeModal from "./scan.barcode.modal";

const ProductTableModals = ({
    dataDetail,
    setDataDetail,
    isDetailOpen,
    setIsDetailOpen,
    isCreateOpen,
    setIsCreateOpen,
    dataUpdate,
    setDataUpdate,
    isModalUpdateOpen,
    setIsModalUpdateOpen,
    isScanBarcodeOpen,
    setIsScanBarcodeOpen,
    loadProduct,
}) => {
    return (
        <>
            <ProductDetail
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
                isDetailOpen={isDetailOpen}
                setIsDetailOpen={setIsDetailOpen}
            />
            <CreateProductUncontrolled
                isCreateOpen={isCreateOpen}
                setIsCreateOpen={setIsCreateOpen}
                loadProduct={loadProduct}
            />
            <UpdateProductUnControl
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                loadProduct={loadProduct}
            />
            <ScanBarcodeModal
                isScanBarcodeOpen={isScanBarcodeOpen}
                setIsScanBarcodeOpen={setIsScanBarcodeOpen}
                loadProduct={loadProduct}
            />
        </>
    );
};

export default ProductTableModals;