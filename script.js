document.addEventListener('DOMContentLoaded', () => {

    const urunVerileri = [];
    for (let i = 1; i <= 56; i++) {
        urunVerileri.push({
            id: i,
            ad: `Ürün ${i}`,
            aciklama: `Bu, ${i}. ürünün kısa açıklamasıdır.`,
            fiyat_adet: 25,
            fiyat_kilo: 50,
            kategori: (i <= 12) ? 'tatlilar' :
                       (i <= 24) ? 'tuzlular' :
                       (i <= 36) ? 'kurabiyeler' :
                       (i <= 48) ? 'atistirmaliklar' :
                       'fit-tarifler'
        });
    }

    const slideshowContainer1 = document.getElementById('slideshow-1');
    const slideshowContainer2 = document.getElementById('slideshow-2');
    const slideshowContainer3 = document.getElementById('slideshow-3');
    const urunListelemeAlani = document.getElementById('urun-listeleme-alani');
    const urunListesiContainer = document.getElementById('urun-listesi-container');
    const kategoriBaslik = urunListelemeAlani.querySelector('h2');
    const sepetIkon = document.getElementById('sepet-ikonu');
    const sepetSayac = document.getElementById('sepet-sayaci');
    const sepetModal = document.getElementById('sepet-modal');
    const sepetListesi = document.getElementById('sepet-listesi');
    const siparisTamamlaBtn = document.getElementById('siparis-tamamla-btn');
    const siparisIptalBtn = document.getElementById('siparis-iptal-btn');
    const sepetOzetToplamUrun = document.getElementById('sepet-toplam-urun');
    const sepetOzetToplamTutar = document.getElementById('sepet-toplam-tutar');

    const urunModal = document.getElementById('urun-modal');
    const bilgiModal = document.getElementById('bilgi-modal');
    const siparisGonderForm = document.getElementById('siparis-gonder-form');
    const homeLinks = document.querySelectorAll('#home-link, .header-title');

    let sepet = {}; // Sepet içeriğini tutacak ana obje

    // Üçlü slayt gösterisi
    function startSlideshow(container) {
        const randomImages = [...urunVerileri].sort(() => 0.5 - Math.random()).slice(0, 10);
        container.innerHTML = '';
        randomImages.forEach(urun => {
            const img = document.createElement('img');
            img.src = `images/${urun.id}.jpg`;
            img.alt = urun.ad;
            container.appendChild(img);
        });
        
        const images = container.querySelectorAll('img');
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
    
    startSlideshow(slideshowContainer1);
    startSlideshow(slideshowContainer2);
    startSlideshow(slideshowContainer3);

    // Ana sayfa butonları ve başlık
    homeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            urunListelemeAlani.style.display = 'none';
            document.querySelector('.slideshow-grid').style.display = 'flex';
        });
    });

    // Kategori menülerini dinleme
    document.querySelectorAll('header nav ul li a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const kategori = e.target.dataset.kategori;
            const baslik = e.target.innerText;
            
            document.querySelector('.slideshow-grid').style.display = 'none';
            urunListelemeAlani.style.display = 'block';

            urunleriListele(kategori, baslik);
        });
    });

    // Ürünleri listeleme
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
                
                document.getElementById('urun-modal-adi').innerText = secilenUrun.ad;
                document.getElementById('adet-input').value = 1;
                document.getElementById('kilo-input').value = 0.5;
                urunModal.style.display = 'block';
                urunModal.querySelector('.add-to-cart-btn').dataset.urunId = urunId;
            });
        });
    }

    // Sepete Ekle
    document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
        const urunId = document.querySelector('.add-to-cart-btn').dataset.urunId;
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
            if (sepet[urunId]) {
                sepet[urunId].miktar += miktar;
                sepet[urunId].tutar += fiyat;
            } else {
                sepet[urunId] = {
                    id: urunId,
                    ad: secilenUrun.ad,
                    miktar: miktar,
                    birim: birim,
                    tutar: fiyat
                };
            }
            
            sepetiGuncelle();
            urunModal.style.display = 'none';
        } else {
            alert('Lütfen geçerli bir miktar girin.');
        }
    });

    // Sepeti güncelleme
    function sepetiGuncelle() {
        sepetListesi.innerHTML = '';
        const sepetKeys = Object.keys(sepet);
        let toplamTutar = 0;
        let toplamUrunSayisi = 0;

        sepetKeys.forEach(urunId => {
            const urun = sepet[urunId];
            const li = document.createElement('li');
            li.innerHTML = `${urun.ad} - ${urun.miktar} ${urun.birim} (${urun.tutar.toFixed(2)} TL) <button class="sepet-sil-btn" data-id="${urun.id}">X</button>`;
            sepetListesi.appendChild(li);
            toplamTutar += urun.tutar;
            toplamUrunSayisi++;
        });

        sepetOzetToplamUrun.innerText = toplamUrunSayisi;
        sepetOzetToplamTutar.innerText = toplamTutar.toFixed(2);
        sepetSayac.innerText = toplamUrunSayisi;

        if (toplamUrunSayisi > 0) {
            sepetSayac.style.display = 'block';
        } else {
            sepetSayac.style.display = 'none';
        }
    }

    // Sepette ürün silme
    sepetListesi.addEventListener('click', (e) => {
        if (e.target.classList.contains('sepet-sil-btn')) {
            const urunId = e.target.dataset.id;
            delete sepet[urunId];
            sepetiGuncelle();
        }
    });

    // Sepeti Açma
    sepetIkon.addEventListener('click', () => {
        sepetModal.style.display = 'block';
    });

    // Siparişi İptal Et
    siparisIptalBtn.addEventListener('click', () => {
        sepet = {};
        sepetiGuncelle();
        sepetModal.style.display = 'none';
        alert('Siparişiniz başarıyla iptal edildi.');
    });

    // Sipariş Tamamlama Modalını Açma
    siparisTamamlaBtn.addEventListener('click', () => {
        sepetModal.style.display = 'none';
        bilgiModal.style.display = 'block';
    });

    // Sipariş Formunu Gönderme
    siparisGonderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let siparisMetni = "";
        Object.keys(sepet).forEach(urunId => {
            const urun = sepet[urunId];
            siparisMetni += `${urun.ad}: ${urun.miktar} ${urun.birim} (${urun.tutar.toFixed(2)} TL)\n`;
        });
        siparisMetni += `\nToplam Tutar: ${sepetOzetToplamTutar.innerText} TL`;

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

        // Size mail gönderme
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', { ...templateParams, to_email: 'kalsnek123@gmail.com', from_email: 'kalsnek123@gmail.com' })
            .then(() => {
                // Müşteriye onay maili gönderme
                emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', { ...templateParams, to_email: formObj.email, from_email: 'kalsnek123@gmail.com' })
                    .then(() => {
                        alert('Siparişiniz alınmıştır. En kısa sürede sizinle iletişime geçilecektir. Bizi seçtiğiniz için teşekkür ederiz.');
                        bilgiModal.style.display = 'none';
                        siparisGonderForm.reset();
                        sepet = {};
                        sepetiGuncelle();
                    }, (error) => {
                        console.error('Müşteriye mail gönderilemedi:', error);
                        alert('Siparişiniz alındı ancak onay maili gönderilirken bir hata oluştu.');
                        bilgiModal.style.display = 'none';
                        siparisGonderForm.reset();
                        sepet = {};
                        sepetiGuncelle();
                    });
            }, (error) => {
                console.error('Sipariş gönderilemedi:', error);
                alert('Sipariş gönderilirken kritik bir hata oluştu. Lütfen tekrar deneyin.');
            });
    });

    // Modal kapatma
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => e.target.closest('.modal').style.display = 'none');
    });
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
});
