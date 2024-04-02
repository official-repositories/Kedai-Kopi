document.addEventListener("alpine:init", () => {
    Alpine.data("products", () => ({
        items: [
            { id: 1, name: 'Rio de Janeiro Robusta', img: 'Product-1.jpg', price: 150},
            { id: 2, name: 'Arabica Blend', img: 'Product-2.jpg', price: 130},
            { id: 3, name: 'Primo Passo', img: 'Product-3.jpg', price: 110},
            { id: 4, name: 'Mers du Sud', img: 'Product-4.jpg', price: 90},
            { id: 5, name: 'Kazan Mix', img: 'Product-5.jpg', price: 85},
        ],
    }));

    Alpine.store("cart", {
        items:[],
        total: 0,
        quantity: 0,
        add(newItem) {
            // cek apakah ada barang yang sama di dalam cart
            const cartItem = this.items.find((item) => item.id === newItem.id);

            // jika belum ada / cart masih kosong
            if (!cartItem) {
                this.items.push({...newItem, quantity: 1, total: newItem.price});
                this.quantity++;
                this.total += newItem.price;
            } else {
                // jika barang sudah ada, cek apakah barang beda atau sama dengan yang di cart
                this.items = this.items.map((item) => {
                    // jika barang beda
                    if (item.id !== newItem.id) {
                        return item;
                    } else {
                        // jika barang sudah ada, tambah quantity dan subtotalnya
                        item.quantity++,
                        item.total = item.price * item.quantity;
                        // data barang keseluruhan
                        this.quantity++;
                        this.total += item.price;
                        return item;
                    }
                });
            }
        },
        remove(id) {
            // ambil item yang mau diremove berdasarkan id nya
            const cartItem = this.items.find((item) => item.id === id);

            // jika item lebih dari 1
            if (cartItem.quantity > 1) {
                // telusuri satu satu
                this.items = this.items.map((item) => {
                // jika bukan barang yang di klik
                if(item.id !== id) {
                    return item;
                } else {
                    item.quantity--;
                    item.total = item.price * item.quantity;
                    this.quantity--;
                    this.total -= item.price;
                    return item;
                }
                });
            } else if (cartItem.quantity === 1){
                // jika barang sisa 1
                this.items = this.items.filter((item) => item.id !== id);
                this.quantity--;
                this.total -= cartItem.price;
            }
        }
    });
});

// Form validation
const checkoutButton = document.querySelector('.checkout-button');
checkoutButton.disabled = true;

const form = document.querySelector('#checkout-form');

form.addEventListener('keyup', function() {
    for(let i= 0; i < form.elements.length; i++) {
        if(form.elements[i].value.length !== 0) {
            checkoutButton.classList.remove('disabled');
            checkoutButton.classList.add('disabled');
        } else {
            return false;
        }
    }
    checkoutButton.disabled = false;
    checkoutButton.classList.remove('disabled');
});

// Kirim data ketika tombol checkout di klik
checkoutButton.addEventListener('click', async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const data = new URLSearchParams(formData);
    const objData = Object.fromEntries(data);
    // const message = formatMessage(objData);

    // minta transaction token menggunakan ajax / fetch
    try {
        const response = await fetch ('php/placeOrder.php', {
            method: 'POST',
            body: data,
        });
        const token = await response.text();
    } catch (err) {
        console.log(err.message);
    }

    window.snap.pay(token);
});

// Format pesan whatsapp
const formatMessage = (obj) => {
    return `Data Customer
    Nama: ${obj.name}
    Email: ${obj.email}
    No HP: ${obj.phone}
    Data Pesanan
    ${JSON.parse(obj.items).map((item) => `{$item.name} (${item.quantity} x ${aud(item.total)}) \n`)}
    TOTAL: ${aud(obj.total)}
    Thankyou.`;
}

// Konversi mata uang
const aud = (number) => {
    return new Intl.NumberFormat('au-AU', {
        style: 'currency',
        currency: 'AUD',
    }).format(number);
}
