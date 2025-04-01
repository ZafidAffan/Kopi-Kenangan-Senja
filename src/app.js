document.addEventListener('alpine:init', () => {

    // 1.) Alpine untuk data product
    Alpine.data("productsAlpine", ()=> ({ // kurawalnya di dalam kurung artinya fungsi callback ini mengembalikan object
        items:[
            {id: 1, name:"Robusta Brazil", img: "1.jpg", price:20000},
            {id: 2, name:"Robusta Amerika", img: "2.jpg", price:25000},
            {id: 3, name:"Robusta Indonesia", img: "3.jpg", price:10000},
            {id: 4, name:"Robusta Malaysia", img: "4.jpg", price:5000},
            {id: 5, name:"Robusta Laos", img: "5.jpg", price:6000}
        ]
    }));

    //2.) alpin untuk keranjang belanja
    Alpine.store('cart', {
        items: [],
        total: 0,
        quantity: 0,

        //dibawah ini adalah method untuk menambah ke variable diatas
        add(newItem){

            //cek apakah ada barang yang sama di cart
            const cartItem = this.items.find((item) => item.id === newItem.id) // carikan apakah ada yang sama di item.id dan newIem.id

            // jika belum ada
            if(!cartItem){
                this.items.push({...newItem, quantity:1, total: newItem.price}); //pake this karena items nya di dalam object, jadi yang di tambahin yang di dalem kurawal
                this.quantity++;
                this.total += newItem.price;
            }
            // Jika barang sudah ada di dalam keranjang, perbarui jumlah dan totalnya
            else{
                this.items = this.items.map((item)=>{ //map untuk menelusuri, Melakukan iterasi pada setiap item dalam keranjang


                     // Jika barang di keranjang yang sedang diperiksa bukan barang yang baru ditambahkan, biarkan tetap sama
                    if(item.id !== newItem.id){
                        return item;
                    }
                    else{
                    // Jika barang di keranjang yang sedang diperiksa adalah barang yang baru ditambahkan, tingkatkan jumlahnya
                        item.quantity++;
                        item.total = item.price * item.quantity;

                        // ini untuk mengubah item semuanya
                        this.quantity++;
                        this.total += item.price;
                        return item;

                    }

                })
            
                        // yang ada "this" nya itu berarti untuk general

            }
        },

        remove(id){

            // ambil item yang mau di remove berdasarkan id nya
            const cartItem = this.items.find((item) => item.id === id);

            // jika item lebih dari 1
            if(cartItem.quantity > 1){

                //telusuri menggunakan map untuk menjalankan iterasi
                this.items = this.items.map((item) =>{

                    //jika barang yang ada di item tidak sama dengan id yang mau di hapus, balikin lagi
                    if(item.id !==id){
                        return item;
                    }

                    else{
                        item.quantity--;
                        item.total = item.price*item.quantity;

                        this.quantity--;
                        this.total -= item.price;
                        return item;
                    }
                })
            }

            else if(cartItem.quantity === 1){ 
                // jika item nya sisa 1

                // buat array/variable baru untuk menyimpan id id yang tidak mau di hapus
                this.items = this.items.filter((item) => item.id !== id);

                this.quantity--;
                this.total -= cartItem.price;

            }

          

        }

    });

});

//  di javascript ada number format
// konversi price ke rupiah
const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID',{
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits : 0 //supaya di belakang komaya gaada nol 2


    }).format(number);
}


// kirim data ketika tombol checkout di klik
//const checkoutButton = document.querySelector('.checkout-button');
// checkoutButton.disabled = true; // supaya ga bisa di klik
//const form = document.querySelector('#checkoutForm');

// form.addEventListener('keyup', function(){
//     for(let i = 0; i < form.elements.length; i++){
//         if(form.elements[i].value.length !==0){
//             checkoutButton.classList.remove('disabled');
//             checkoutButton.classList.add('disabled');
            
//         }
//         else{
//             return false;
//         }
//     }
//     checkoutButton.disabled = false;
//     checkoutButton.classList.remove('disabled');
// })




// Pastikan elemen ada sebelum menambahkan event listener
const checkoutButton = document.querySelector('.checkout-button');
const form = document.querySelector('#checkoutForm');

if (checkoutButton && form) {
    checkoutButton.addEventListener('click', async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const objData = Object.fromEntries(formData);

        // Ambil data dari Alpine.js
        const cartStore = Alpine.store('cart');
        objData.total = cartStore.total || 0;
        objData.items = cartStore.items.length ? cartStore.items : [];

        // Validasi sebelum mengirim
        if (objData.total <= 0 || objData.items.length === 0) {
            console.error("Keranjang belanja kosong atau total tidak valid!");
            alert("Keranjang belanja Anda kosong!");
            return;
        }

        console.log("Data yang dikirim ke server:", objData);

        try {
            const response = await fetch('php/placeorder.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(objData)
            });

            const result = await response.json();
            console.log("Response dari server:", result);

            if (result.token) {
                if (window.snap && typeof window.snap.pay === "function") {
                    window.snap.pay(result.token);
                } else {
                    console.error("Midtrans snap.js tidak ditemukan!");
                    alert("Terjadi kesalahan: Midtrans tidak tersedia.");
                }
            } else {
                console.error("Gagal mendapatkan token:", result.error);
                alert("Gagal mendapatkan token pembayaran!");
            }
        } catch (err) {
            console.error("Error saat fetch:", err);
            alert("Terjadi kesalahan saat memproses pembayaran.");
        }
    });
} else {
    console.error("Elemen checkout button atau form tidak ditemukan!");
}


//kode sebelumnya yang error dari pak sandhika

// checkoutButton.addEventListener('click', async function (e) {
//     e.preventDefault();
//     const formData = new FormData(form);
//     const data = new URLSearchParams(formData);
//     const objData = Object.fromEntries(data);

//     // minta transaction token pake ajax/fetch
//     try{
//         const response = await fetch('php/placeorder.php',{
//             method: 'POST',
//             body: data,
//         });
//         const token = await response.text();
//         console.log(token);
//         //window.snap.pay('token');

//     }   catch (err) {
//         console.log(err,mesage);
//     }

// });