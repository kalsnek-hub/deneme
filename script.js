document.addEventListener('DOMContentLoaded', () => {

    const urunVerileri = [];
    for (let i = 1; i <= 56; i++) {
        urunVerileri.push({
            id: i,
            ad: `Ürün ${i}`,
            aciklama: `Bu, ${i}. ürünün kısa açıklamasıdır.`,
            fiyat_adet: 25, // Her ürün için bir adet fiyatı belirledik
            fiyat_kilo: 50, // Her ürün için bir kilo fiyatı belirledik
            kategori: (i <= 12) ? 'tatlilar' :
                       (i <= 24) ? 'tuzlular' :
                       (i <= 36) ? 'kurabiyeler' :
                       (i <= 48) ? 'atistirmaliklar' :
                       'fit-tarifler'
        });
    }

    const slideshowContainer = document.getElementById('slideshow-container');
    const urunListelemeAlani = document.getElementById('urun-listeleme-alani');
    const urunListesiContainer = document.getElementById('urun-listesi-container');
    const kategoriBaslik = urunListelemeAlani.querySelector('h2');
    const siparisListesi = document.getElementById('siparis-listesi');
    const tamamlaBtn = document.getElementById('tamamla-btn');
    const siparisler = {};
    const homeLinks = document.querySelectorAll('#home-link, .header-title');

    const urunModal = document.getElementById('modal');
    const tamamlamaModal = document.getElementById('tamamlama-modal');
    const siparisGonderForm = document.getElementById('siparis-gonder-form');
    const siparisOzetField = document.getElementById('siparis-ozet-field');
    const siparisOzetDiv = document.getElementById('siparis-ozet');
    const toplamUrunSpan = document.getElementById('toplam-urun');
    const toplamTutarSpan = document.getElementById('toplam-tutar');

    // Slayt gösterisini başlatma
    function startSlideshow() {
        slideshowContainer.innerHTML = '';
        for (let i = 1; i <= 56; i++) {
            const img = document.createElement('img');
            img.src = `images/${i}.jpg`;
            img.alt = `Ürün ${i}`;
            slideshowContainer.appendChild(img);
        }

        const images = slideshowContainer.querySelectorAll('img');
        let currentIndex = 0;
        if (images.length > 0) {
            images[currentIndex].classList.add('active');

            setInterval(() => {
                images[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % images.length;
                images[currentIndex].classList.add('active');
            }, 4000);
        }
    }
    
    startSlideshow();

    // Ana sayfa butonları ve başlık
    homeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            urunListelemeAlani.style.display = 'none';
            slideshowContainer.style.display = 'block';
        });
    });

    // Kategori menülerini dinleme
    document.querySelectorAll('header nav ul li a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const kategori = e.target.dataset.kategori;
            const baslik = e.target.innerText;
            
            slideshowContainer.style.display = 'none';
            urunListelemeAlani.style.display = 'block';

            urunleriListele(kategori, baslik);
        });
    });

    // Ürünleri listeleme fonksiyonu
    function urunleriListele(kategori, baslik) {
        urunListesiContainer.innerHTML = '';
        kategoriBaslik.innerText = baslik;

        const filtrelenmisUrunler = urunVerileri.filter(urun => urun.kategori === kategori);

        filtrelenmisUrunler.forEach(urun => {
            const urunElementi = document.createElement('div');
            urunElementi.classList.add('urun');
            urunElementi.setAttribute('data-id', urun.id);
            urunElementi.innerHTML = `
                <img src="images/${urun.id}.jpg" alt="${urun.ad}">
                <div class="bilgi-penceresi">
                    <h3>${urun.ad}</h3>
                    <p>${urun.aciklama}</p>
                </div>
            `;
            urunListesiContainer.appendChild(urunElementi);
        });
        
        document.querySelectorAll('.urun').forEach(urun => {
            urun.addEventListener('click', (e) => {
                const urunId = e.currentTarget.dataset.id;
                const secilenUrun = urunVerileri.find(u => u.id == urunId);
                
                document.getElementById('modal-urun-adi').innerText = secilenUrun.ad;
                document.getElementById('adet-fiyat').innerText = secilenUrun.fiyat_adet;
                document.getElementById('kilo-fiyat').innerText = secilenUrun.fiyat_kilo;
                urunModal.style.display = 'block';
                urunModal.querySelector('.add-to-cart-btn').dataset.urunId = urunId;
            });
        });
    }

    // Sepete Ekle butonu
    urunModal.querySelector('.add-to-cart-btn').addEventListener('click', () => {
        const urunId = urunModal.querySelector('.add-to-cart-btn').dataset.urunId;
        const secilenUrun = urunVerileri.find(u => u.id == urunId);
        let miktar;
        let birim;
        let fiyat;

        if (document.querySelector('.tab-btn.active').dataset.tab === 'adet') {
            miktar = parseFloat(document.getElementById('adet-input').value);
            birim = "Adet";
            fiyat = secilenUrun.fiyat_adet * miktar;
        } else {
            miktar = parseFloat(document.getElementById('kilo-input').value);
            birim = "Kilo";
            fiyat = secilenUrun.fiyat_kilo * miktar;
        }

        if (miktar && miktar > 0) {
            if (siparisler[urunId]) {
                siparisler[urunId].miktar += miktar;
                siparisler[urunId].tutar += fiyat;
            } else {
                siparisler[urunId] = {
                    ad: secilenUrun.ad,
                    miktar: miktar,
                    birim: birim,
                    tutar: fiyat
                };
            }
            
            siparisListesiniGuncelle();
            
            urunModal.style.display = 'none';
        } else {
            alert('Lütfen geçerli bir miktar girin.');
        }
    });

    // Sipariş listesini ve özeti güncelleyen fonksiyon
    function siparisListesiniGuncelle() {
        siparisListesi.innerHTML = '';
        const siparisKeys = Object.keys(siparisler);
        let toplamTutar = 0;
        let toplamUrunSayisi = 0;

        if (siparisKeys.length > 0) {
            tamamlaBtn.style.display = 'block';
            siparisOzetDiv.style.display = 'block';
            siparisKeys.forEach(urunId => {
                const siparis = siparisler[urunId];
                const yeniSiparis = document.createElement('li');
                yeniSiparis.innerHTML = `${siparis.ad} - ${siparis.miktar} ${siparis.birim} (${siparis.tutar.toFixed(2)} TL)`;
                siparisListesi.appendChild(yeniSiparis);
                toplamTutar += siparis.tutar;
                toplamUrunSayisi++;
            });
        } else {
            tamamlaBtn.style.display = 'none';
            siparisOzetDiv.style.display = 'none';
        }

        toplamUrunSpan.innerText = toplamUrunSayisi;
        toplamTutarSpan.innerText = toplamTutar.toFixed(2);
    }

    // Siparişi Tamamla butonu
    tamamlaBtn.addEventListener('click', () => {
        tamamlamaModal.style.display = 'block';
    });
    
    // Sipariş formunu gönderme
    siparisGonderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let siparisMetni = "";
        Object.keys(siparisler).forEach(urunId => {
            const siparis = siparisler[urunId];
            siparisMetni += `${siparis.ad}: ${siparis.miktar} ${siparis.birim} (${siparis.tutar.toFixed(2)} TL)\n`;
        });
        siparisMetni += `\nToplam Tutar: ${toplamTutarSpan.innerText} TL`;
        
        // Form verilerini ve sipariş özetini içeren tek bir obje oluşturuyoruz
        const formData = new FormData(siparisGonderForm);
        const formObj = Object.fromEntries(formData.entries());
        
        const templateParams = {
            ad_soyad: formObj.ad_soyad,
            email: formObj.email,
            telefon: formObj.telefon,
            adres: formObj.adres,
            notlar: formObj.notlar,
            teslimat: formObj.teslimat,
            odeme: formObj.odeme,
            siparis_ozet: siparisMetni
        };

        // Hem size hem de müşteriye mail gönderimi
        emailjs.send('service_iuypx76', 'template_pejv735', { ...templateParams, to_email: 'kalsnek123@gmail.com', from_email: 'kalsnek123@gmail.com' })
            .then(function(response) {
                console.log('Sipariş başarıyla size iletildi.', response);

                emailjs.send('service_iuypx76', 'template_pejv735', { ...templateParams, to_email: formObj.email, from_email: 'kalsnek123@gmail.com' })
                    .then(function(response) {
                        alert('Siparişiniz başarıyla alındı ve size bir onay e-postası gönderildi!');
                        tamamlamaModal.style.display = 'none';
                        siparisGonderForm.reset();
                        Object.keys(siparisler).forEach(key => delete siparisler[key]);
                        siparisListesiniGuncelle();
                    }, function(error) {
                        alert('Siparişiniz alındı ancak onay e-postası gönderilirken bir hata oluştu: ' + JSON.stringify(error));
                        tamamlamaModal.style.display = 'none';
                        siparisGonderForm.reset();
                        Object.keys(siparisler).forEach(key => delete siparisler[key]);
                        siparisListesiniGuncelle();
                    });

            }, function(error) {
                alert('Sipariş gönderilirken kritik bir hata oluştu: ' + JSON.stringify(error));
            });
    });

    // Modal kapatma butonları
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
});
