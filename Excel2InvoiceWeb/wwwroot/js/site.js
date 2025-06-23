// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

// Biến toàn cục để lưu trữ dữ liệu
let currentData = [];
let allData = []; // Lưu trữ tất cả dữ liệu (bao gồm cả dòng có giá trị 0)
let fileName = '';
let currentWorkbook = null;

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const selectFileBtn = document.getElementById('selectFileBtn');
    
    if (!fileInput) {
        console.error('Không tìm thấy fileInput element');
        return;
    }
    
    // Xử lý upload file
    fileInput.addEventListener('change', handleFileSelect);
    
    // Xử lý click button chọn file
    if (selectFileBtn) {
        selectFileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });
    }
    
    // Xử lý drag & drop nếu uploadArea tồn tại
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        
        // Click vào upload area (ngoài button)
        uploadArea.addEventListener('click', function(e) {
            // Chỉ trigger nếu không click vào button
            if (e.target !== selectFileBtn && !selectFileBtn.contains(e.target)) {
                fileInput.click();
            }
        });
    }
}

// Xử lý drag over
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

// Xử lý drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

// Xử lý drop file
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// Xử lý chọn file
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// Xử lý file Excel
function handleFile(file) {
    if (!file) return;
    
    // Kiểm tra định dạng file
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                       'application/vnd.ms-excel'];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        showError('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        return;
    }
    
    fileName = file.name;
    showLoading(true);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            parseExcelData(e.target.result);
        } catch (error) {
            console.error('Lỗi đọc file:', error);
            showError('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.');
        } finally {
            showLoading(false);
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Phân tích dữ liệu Excel
function parseExcelData(arrayBuffer) {
    currentWorkbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    if (currentWorkbook.SheetNames.length === 0) {
        showError('File Excel không có sheet nào');
        return;
    }
    
    // Nếu có nhiều sheet, hiển thị danh sách để chọn
    if (currentWorkbook.SheetNames.length > 1) {
        showSheetSelector();
    } else {
        // Nếu chỉ có 1 sheet, xử lý luôn
        processSheet(currentWorkbook.SheetNames[0]);
    }
}

// Hiển thị danh sách sheet để chọn
function showSheetSelector() {
    const sheetOptions = currentWorkbook.SheetNames.map(name => 
        `<option value="${name}">${name}</option>`
    ).join('');
    
    const selectorHtml = `
        <div class="sheet-selector-card">
            <h3><i class="fas fa-list"></i> Chọn sheet/công ty</h3>
            <p>File Excel có ${currentWorkbook.SheetNames.length} sheet. Vui lòng chọn sheet cần xuất hóa đơn:</p>
            <div class="sheet-selector">
                <select id="sheetSelect" class="sheet-select">
                    <option value="">-- Chọn sheet --</option>
                    ${sheetOptions}
                </select>
                <button onclick="loadSelectedSheet()" class="btn-primary">
                    <i class="fas fa-check"></i> Xác nhận
                </button>
            </div>
        </div>
    `;
    
    // Tạo section chọn sheet
    const sheetSection = document.createElement('section');
    sheetSection.className = 'upload-section';
    sheetSection.id = 'sheetSelectorSection';
    sheetSection.innerHTML = selectorHtml;
    
    // Thêm vào sau upload section
    const uploadSection = document.querySelector('.upload-section');
    uploadSection.parentNode.insertBefore(sheetSection, uploadSection.nextSibling);
}

// Xử lý khi user chọn sheet
function loadSelectedSheet() {
    const sheetSelect = document.getElementById('sheetSelect');
    const selectedSheet = sheetSelect.value;
    
    if (!selectedSheet) {
        showError('Vui lòng chọn sheet');
        return;
    }
    
    // Ẩn sheet selector
    const sheetSection = document.getElementById('sheetSelectorSection');
    if (sheetSection) {
        sheetSection.remove();
    }
    
    // Xử lý sheet đã chọn
    processSheet(selectedSheet);
}

// Xử lý dữ liệu từ sheet cụ thể
function processSheet(sheetName) {
    const worksheet = currentWorkbook.Sheets[sheetName];
    
    // Chuyển đổi sheet thành JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
        showError(`Sheet "${sheetName}" không có dữ liệu hoặc định dạng không đúng`);
        return;
    }
    
    // Lấy header và data
    const headers = jsonData[0];
    const rows = jsonData.slice(1);
    

    
    // Chuyển đổi sang định dạng object (lưu tất cả dữ liệu)
    allData = rows.map((row, index) => {
        const obj = {};
        headers.forEach((header, headerIndex) => {
            obj[header] = row[headerIndex];
        });
        return obj;
    }).filter(row => {
        // Chỉ lọc bỏ các hàng hoàn toàn trống (tất cả giá trị đều null/undefined/empty)
        return Object.values(row).some(value => 
            value !== '' && 
            value !== null && 
            value !== undefined
        );
    });
    
    // Lọc dữ liệu hiện tại (chỉ những dòng có nội dung thực sự)
    currentData = allData.filter(row => hasValidContent(row));
    

    
    if (allData.length === 0) {
        showError(`Sheet "${sheetName}" không có dữ liệu`);
        return;
    }
    
    if (currentData.length === 0) {
        // Nếu không có dữ liệu valid, hiển thị thông báo nhưng vẫn cho phép xem tất cả
        console.log('Không có dữ liệu hợp lệ, hiển thị tất cả dữ liệu');
        currentData = allData;
    }
    
    // Lưu tên sheet hiện tại (chỉ thêm nếu chưa có)
    if (!fileName.includes(`(${sheetName})`)) {
        fileName = fileName + ` (${sheetName})`;
    }
    
    // Hiển thị dữ liệu
    displayData();
    showSection('dataSection');
}

// Hiển thị dữ liệu trong bảng
function displayData() {
    const tableBody = document.getElementById('dataTableBody');
    tableBody.innerHTML = '';
    
    currentData.forEach((row, index) => {
        const tr = document.createElement('tr');
        
        // Danh sách các cột cần hiển thị
        const columns = ['STT', 'Ngày tháng', 'Loại giao dịch', 'Loại hàng', 
                        'Đơn giá', 'Số lượng', 'Thành tiền', 'Thanh toán', 'Còn nợ', 'Ghi chú'];
        
        columns.forEach(col => {
            const td = document.createElement('td');
            let value = row[col] || '';
            
            // Format số tiền
            if (['Đơn giá', 'Thành tiền', 'Thanh toán', 'Còn nợ'].includes(col)) {
                value = formatCurrency(value);
            } else if (col === 'Ngày tháng') {
                value = formatDate(value);
            }
            
            td.textContent = value;
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
    
    // Cập nhật thống kê
    updateSummary();
}

// Tính tổng từ dữ liệu Excel (dùng chung cho tất cả functions)
function calculateTotalsFromExcel() {
    if (currentData.length === 0) {
        return { totalAmount: 0, totalPaid: 0, totalDebt: 0 };
    }
    
    let totalAmount = 0;
    let totalPaid = 0;
    let totalDebt = 0;
    
    // Tính tổng thành tiền từ tất cả dòng có giá trị
    currentData.forEach(row => {
        const amount = parseFloat(row['Thành tiền']) || 0;
        const paid = parseFloat(row['Thanh toán']) || 0;
        if (amount > 0) {
            totalAmount += amount;
        }
        if (paid > 0) {
            totalPaid += paid;
        }
    });
    
    // Lấy số nợ cuối cùng từ dòng cuối cùng có giá trị
    // Tìm dòng cuối cùng có giá trị "Còn nợ" > 0
    for (let i = currentData.length - 1; i >= 0; i--) {
        const debtValue = parseFloat(currentData[i]['Còn nợ']) || 0;
        if (debtValue > 0) {
            totalDebt = debtValue;
            break;
        }
    }
    
    return { totalAmount, totalPaid, totalDebt };
}

// Cập nhật thống kê tổng hợp
function updateSummary() {
    const totalTransactions = currentData.length;
    const { totalAmount, totalPaid, totalDebt } = calculateTotalsFromExcel();
    
    document.getElementById('totalTransactions').textContent = totalTransactions;
    document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('totalPaid').textContent = formatCurrency(totalPaid);
    document.getElementById('totalDebt').textContent = formatCurrency(totalDebt);
}

// Tạo hóa đơn
function generateInvoice() {
    const invoiceHtml = createInvoiceHTML();
    document.getElementById('invoicePreview').innerHTML = invoiceHtml;
    showSection('invoiceSection');
}

// Tạo HTML cho hóa đơn
function createInvoiceHTML() {
    const currentDate = new Date().toLocaleDateString('vi-VN');
    const invoiceNumber = 'HD' + Date.now().toString().slice(-6);
    
    const { totalAmount, totalPaid, totalDebt } = calculateTotalsFromExcel();
    
    let tableRows = '';
    currentData.forEach((row, index) => {
        tableRows += `
            <tr>
                <td>${index + 1}</td>
                <td>${formatDate(row['Ngày tháng'])}</td>
                <td>${row['Loại hàng'] || ''}</td>
                <td>${formatCurrency(row['Đơn giá'])}</td>
                <td>${row['Số lượng'] || ''}</td>
                <td class="text-right">${formatCurrency(row['Thành tiền'])}</td>
            </tr>
        `;
    });
    
    return `
        <div class="invoice-header">
            <div>
                <h1 class="invoice-title">HÓA ĐƠN THANH TOÁN</h1>
                <p><strong>Số hóa đơn:</strong> ${invoiceNumber}</p>
            </div>
            <div class="invoice-info">
                <p><strong>Ngày tạo:</strong> ${currentDate}</p>
                <p><strong>File gốc:</strong> ${fileName}</p>
            </div>
        </div>
        
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Ngày</th>
                    <th>Mặt hàng</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th class="text-right">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
        
        <div class="invoice-total">
            <div class="invoice-total-row">
                <span>Tổng cộng:</span>
                <span>${formatCurrency(totalAmount)}</span>
            </div>
            <div class="invoice-total-row">
                <span>Đã thanh toán:</span>
                <span>${formatCurrency(totalPaid)}</span>
            </div>
            <div class="invoice-total-row final">
                <span>Còn phải thu:</span>
                <span>${formatCurrency(totalDebt)}</span>
            </div>
        </div>
        
        <div style="margin-top: 50px; text-align: center; color: #64748b;">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
            <p>Hóa đơn được tạo tự động từ hệ thống Excel to Invoice</p>
        </div>
    `;
}

// Tải xuống PDF với giao diện đẹp
function downloadPDF() {
    showLoading(true);
    
    try {
        // Tạo element HTML tạm thời cho PDF với design đẹp
        const pdfContent = createPDFContent();
        document.body.appendChild(pdfContent);
        
        // Sử dụng html2canvas để chuyển HTML thành canvas
        html2canvas(pdfContent, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 800,
            height: pdfContent.scrollHeight
        }).then(canvas => {
            // Tạo PDF từ canvas
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            // Nếu nội dung quá cao, chia thành nhiều trang
            if (imgHeight > 297) { // A4 height
                let remainingHeight = imgHeight - 297;
                let yPosition = -297;
                
                while (remainingHeight > 0) {
                    doc.addPage();
                    const pageHeight = Math.min(remainingHeight, 297);
                    doc.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight);
                    yPosition -= 297;
                    remainingHeight -= 297;
                }
            }
            
            const invoiceNumber = 'HD' + Date.now().toString().slice(-6);
            doc.save(`hoa-don-${invoiceNumber}.pdf`);
            
            // Xóa element tạm thời
            document.body.removeChild(pdfContent);
            showLoading(false);
            
        }).catch(error => {
            console.error('Lỗi tạo PDF:', error);
            showError('Có lỗi xảy ra khi tạo file PDF');
            document.body.removeChild(pdfContent);
            showLoading(false);
        });
        
    } catch (error) {
        console.error('Lỗi tạo PDF:', error);
        showError('Có lỗi xảy ra khi tạo file PDF');
        showLoading(false);
    }
}

// Tạo nội dung HTML cho PDF với design đẹp
function createPDFContent() {
    const { totalAmount, totalPaid, totalDebt } = calculateTotalsFromExcel();
    const currentDate = new Date().toLocaleDateString('vi-VN');
    const invoiceNumber = 'HD' + Date.now().toString().slice(-6);
    
    const pdfElement = document.createElement('div');
    pdfElement.style.cssText = `
        position: fixed;
        top: -10000px;
        left: -10000px;
        width: 800px;
        background: white;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        padding: 40px;
        box-sizing: border-box;
        color: #1a1a1a;
    `;
    
    let tableRows = '';
    currentData.forEach((row, index) => {
        tableRows += `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 8px; text-align: center; font-weight: 500;">${index + 1}</td>
                <td style="padding: 12px 8px;">${formatDate(row['Ngày tháng'])}</td>
                <td style="padding: 12px 8px;">${row['Loại hàng'] || ''}</td>
                <td style="padding: 12px 8px; text-align: right;">${formatCurrency(row['Đơn giá'])}</td>
                <td style="padding: 12px 8px; text-align: center;">${row['Số lượng'] || ''}</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: #059669;">${formatCurrency(row['Thành tiền'])}</td>
            </tr>
        `;
    });
    
    pdfElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 32px; font-weight: 700; color: #1f2937; margin: 0 0 10px 0; letter-spacing: -0.5px;">
                HÓA ĐƠN THANH TOÁN
            </h1>
            <p style="font-size: 16px; color: #6b7280; margin: 0;">Số hóa đơn: <strong style="color: #1f2937;">${invoiceNumber}</strong></p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6;">
            <div>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Ngày tạo</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">${currentDate}</p>
            </div>
            <div style="text-align: right;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">File gốc</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">${fileName}</p>
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <thead>
                    <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <th style="padding: 16px 8px; text-align: center; font-weight: 600; font-size: 14px;">STT</th>
                        <th style="padding: 16px 8px; text-align: left; font-weight: 600; font-size: 14px;">Ngày</th>
                        <th style="padding: 16px 8px; text-align: left; font-weight: 600; font-size: 14px;">Mặt hàng</th>
                        <th style="padding: 16px 8px; text-align: right; font-weight: 600; font-size: 14px;">Đơn giá</th>
                        <th style="padding: 16px 8px; text-align: center; font-weight: 600; font-size: 14px;">Số lượng</th>
                        <th style="padding: 16px 8px; text-align: right; font-weight: 600; font-size: 14px;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody style="background: white;">
                    ${tableRows}
                </tbody>
            </table>
        </div>
        
        <div style="margin-top: 40px; padding: 24px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-size: 16px; color: #4b5563;">Tổng cộng:</span>
                <span style="font-size: 16px; font-weight: 600; color: #1f2937;">${formatCurrency(totalAmount)} VNĐ</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-size: 16px; color: #4b5563;">Đã thanh toán:</span>
                <span style="font-size: 16px; font-weight: 600; color: #059669;">${formatCurrency(totalPaid)} VNĐ</span>
            </div>
            <hr style="margin: 16px 0; border: none; border-top: 2px solid #d1d5db;">
            <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 18px; font-weight: 700; color: #1f2937;">Còn phải thu:</span>
                <span style="font-size: 18px; font-weight: 700; color: #dc2626;">${formatCurrency(totalDebt)} VNĐ</span>
            </div>
        </div>
        
        <div style="margin-top: 50px; text-align: center; padding: 20px; border-top: 2px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1f2937;">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Hóa đơn được tạo tự động từ hệ thống Excel to Invoice</p>
        </div>
    `;
    
    return pdfElement;
}

// Hiển thị section
function showSection(sectionId) {
    // Ẩn tất cả sections
    const sections = ['dataSection', 'invoiceSection'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Hiển thị section được chọn
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.style.display = 'block';
}

// Ẩn hóa đơn
function hideInvoice() {
    showSection('dataSection');
}

// Toggle hiển thị dòng có giá trị 0
function toggleZeroRows() {
    const showZeroRows = document.getElementById('showZeroRows').checked;
    
    if (showZeroRows) {
        // Hiển thị tất cả dữ liệu (bao gồm dòng có giá trị 0)
        currentData = allData;
    } else {
        // Chỉ hiển thị dữ liệu có nội dung thực sự
        currentData = allData.filter(row => hasValidContent(row));
    }
    
    // Cập nhật hiển thị
    displayData();
}

// Xóa dữ liệu
function clearData() {
    if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu?')) {
        currentData = [];
        allData = [];
        fileName = '';
        currentWorkbook = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('dataTableBody').innerHTML = '';
        document.getElementById('invoicePreview').innerHTML = '';
        
        // Reset checkbox
        const showZeroCheckbox = document.getElementById('showZeroRows');
        if (showZeroCheckbox) {
            showZeroCheckbox.checked = false;
        }
        
        // Xóa sheet selector nếu có
        const sheetSection = document.getElementById('sheetSelectorSection');
        if (sheetSection) {
            sheetSection.remove();
        }
        
        // Ẩn tất cả sections
        const sections = ['dataSection', 'invoiceSection'];
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });
        
        // Reset summary
        document.getElementById('totalTransactions').textContent = '0';
        document.getElementById('totalAmount').textContent = '0';
        document.getElementById('totalPaid').textContent = '0';
        document.getElementById('totalDebt').textContent = '0';
    }
}

// Hiển thị loading
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// Hiển thị lỗi
function showError(message) {
    alert('Lỗi: ' + message);
}

// Format tiền tệ
function formatCurrency(value) {
    if (!value || isNaN(value)) return '0';
    
    const number = parseFloat(value);
    return new Intl.NumberFormat('vi-VN').format(number);
}

// Kiểm tra xem một dòng có nội dung thực sự hay không
function hasValidContent(row) {
    // Kiểm tra xem có bất kỳ cột nào có giá trị khác 0 và không trống không
    for (let key in row) {
        const value = row[key];
        
        // Bỏ qua cột STT
        if (key === 'STT') continue;
        
        // Kiểm tra giá trị
        if (value !== null && 
            value !== undefined && 
            value !== '' && 
            value !== 0 && 
            value !== '0') {
            
            // Nếu là string
            if (typeof value === 'string') {
                const trimmedValue = value.toString().trim();
                if (trimmedValue !== '' && 
                    trimmedValue !== '0' && 
                    trimmedValue.toLowerCase() !== 'null' &&
                    trimmedValue.toLowerCase() !== 'undefined') {
                    return true;
                }
            } 
            // Nếu là number
            else if (typeof value === 'number' && value > 0) {
                return true;
            }
        }
    }
    
    return false;
}

// Format ngày tháng
function formatDate(value) {
    if (!value) return '';
    
    // Nếu là số Excel date
    if (typeof value === 'number') {
        // Excel date to JS date
        const excelDate = new Date((value - 25569) * 86400 * 1000);
        return excelDate.toLocaleDateString('vi-VN');
    }
    
    // Nếu đã là string
    if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('vi-VN');
        }
    }
    
    return value.toString();
}
