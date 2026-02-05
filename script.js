let items = {
    coffee: { price: 50, qty: 0 },
    burger: { price: 120, qty: 0 },
    pizza: { price: 200, qty: 0 },
    cake: { price: 90, qty: 0 }
};

const TAX_RATE = 0.05;
const REWARD_THRESHOLD = 999;
const DISCOUNT_CODE = "SAVE50";
const DISCOUNT_AMOUNT = 50;

function filterMenu() {
    const cat = document.getElementById('categoryFilter').value;
    const elements = document.getElementsByClassName('item');
    for (let el of elements) {
        if (cat === 'all' || el.getAttribute('data-category') === cat) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    }
}

function changeQty(itemName, amount) {
    if (items[itemName].qty + amount >= 0) {
        items[itemName].qty += amount;
        document.getElementById("q" + capitalize(itemName)).innerText = items[itemName].qty;
        updateTotal();
    }
}

function updateTotal() {
    let subtotal = 0;
    for (let key in items) { subtotal += items[key].price * items[key].qty; }
    
    const totalEl = document.getElementById("total");
    const rewardNotice = document.getElementById("rewardNotice");
    
    totalEl.innerText = "Total: ₹" + subtotal;

    // Free Coffee Logic
    if (subtotal > REWARD_THRESHOLD) {
        rewardNotice.innerText = "🎉 High Roller! You've unlocked a FREE Coffee!";
        rewardNotice.style.color = "#d81b60";
    } else {
        rewardNotice.innerText = `Add ₹${REWARD_THRESHOLD - subtotal + 1} more to get a FREE Coffee! ☕`;
        rewardNotice.style.color = "#4caf50";
    }
    
    return subtotal;
}

function toggleModal(show) {
    const modal = document.getElementById("cartModal");
    if (show) {
        const name = document.getElementById("custName").value || "Valued Customer";
        const table = document.getElementById("tableNo").value || "N/A";
        const couponEntered = document.getElementById("couponInput").value.trim().toUpperCase();
        
        document.getElementById("billInfo").innerHTML = `
            <strong>Customer:</strong> ${name}<br>
            <strong>Table:</strong> ${table}<br>
            <strong>Date:</strong> ${new Date().toLocaleString()}
        `;

        let html = "";
        let subtotal = 0;
        for (let key in items) {
            if (items[key].qty > 0) {
                let cost = items[key].qty * items[key].price;
                subtotal += cost;
                html += `<div class="cart-row"><span>${capitalize(key)} x ${items[key].qty}</span><span>₹${cost}</span></div>`;
            }
        }

        // Discount Logic
        let discount = 0;
        let couponMsg = "";
        if (couponEntered === DISCOUNT_CODE && subtotal > 0) {
            discount = DISCOUNT_AMOUNT;
            couponMsg = `<span style="color: #4caf50;">✔ Coupon SAVE50 Applied (-₹50)</span>`;
        } else if (couponEntered !== "") {
            couponMsg = `<span style="color: #f44336;">✘ Invalid Coupon</span>`;
        }

        // Free Coffee Row
        let rewardHtml = "";
        if (subtotal > REWARD_THRESHOLD) {
            rewardHtml = `<div class="cart-row" style="color: #4caf50; font-weight: bold;">
                            <span>🎁 Loyalty Reward: 1x Coffee</span><span>FREE</span>
                          </div>`;
        }
        
        let tax = subtotal * TAX_RATE;
        let grandTotal = (subtotal + tax) - discount;
        if (grandTotal < 0) grandTotal = 0; // Prevent negative total

        document.getElementById("cartItems").innerHTML = html || "<p style='text-align:center;'>Empty Cart!</p>";
        document.getElementById("rewardRow").innerHTML = rewardHtml;
        document.getElementById("couponStatus").innerHTML = couponMsg;
        document.getElementById("taxDetails").innerHTML = `
            <div class="tax-row"><span>Subtotal:</span><span>₹${subtotal}</span></div>
            <div class="tax-row"><span>GST (5%):</span><span>₹${tax.toFixed(2)}</span></div>
            ${discount > 0 ? `<div class="tax-row" style="color: #4caf50;"><span>Discount:</span><span>-₹${discount}</span></div>` : ''}
            <div class="cart-row" style="font-size: 1.2em; border-bottom: none; color: #d81b60; margin-top: 10px;">
                <strong>Grand Total:</strong><strong>₹${grandTotal.toFixed(2)}</strong>
            </div>
        `;
        modal.style.display = "block";
    } else {
        modal.style.display = "none";
    }
}

function capitalize(word) { return word.charAt(0).toUpperCase() + word.slice(1); }

function generateInvoice() {
    let subtotal = 0;
    for (let key in items) { subtotal += items[key].price * items[key].qty; }
    if (subtotal === 0) return;

    const couponEntered = document.getElementById("couponInput").value.trim().toUpperCase();
    let discount = (couponEntered === DISCOUNT_CODE) ? DISCOUNT_AMOUNT : 0;
    const tax = subtotal * TAX_RATE;
    const grandTotal = (subtotal + tax) - discount;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const name = document.getElementById("custName").value || "Customer";
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(216, 27, 96);
    doc.text("CRAVINGS CAFE", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("123 Foodie Street, Flavor Town | +91 98765 43210", 105, 28, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Customer: ${name}`, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 45);
    doc.line(20, 50, 190, 50);

    let y = 60;
    for (let key in items) {
        if (items[key].qty > 0) {
            doc.text(`${capitalize(key)} x ${items[key].qty}`, 20, y);
            doc.text(`Rs. ${items[key].qty * items[key].price}`, 160, y);
            y += 10;
        }
    }

    if (subtotal > REWARD_THRESHOLD) {
        doc.setTextColor(76, 175, 80);
        doc.text("Loyalty Reward: 1x Free Coffee", 20, y);
        doc.text("FREE", 160, y);
        doc.setTextColor(0);
        y += 10;
    }

    doc.line(120, y, 190, y);
    doc.text(`Subtotal: Rs. ${subtotal}`, 160, y + 10, { align: "right" });
    doc.text(`GST (5%): Rs. ${tax.toFixed(2)}`, 160, y + 18, { align: "right" });
    
    if(discount > 0) {
        doc.setTextColor(76, 175, 80);
        doc.text(`Discount (SAVE50): -Rs. ${discount}`, 160, y + 26, { align: "right" });
        y += 8;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(216, 27, 96);
    doc.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 160, y + 28, { align: "right" });
    
    doc.save(`${name}_Cravings_Receipt.pdf`);
}