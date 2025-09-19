document.addEventListener('DOMContentLoaded', () => {

    // 56 ürünün tüm verileri burada saklanıyor
    const urunVerileri = [];
    for (let i = 1; i <= 56; i++) {
        urunVerileri.push({
            id: i,
            ad: `Ürün ${i}`,
            aciklama: `Bu, ${i}. ürünün kısa açıklamasıdır.`,
            kategori: (i <= 12) ? 'tatlilar' :
                       (i <= 24) ? 'tuzlular' :
                       (i <= 36) ? 'kurabiyeler' :
                       (i <= 48) ? 'atistirmaliklar' :
                       'fit-tarifler'
        });
    }

    const anaSayfaResmi = document.getElementById('ana-sayfa-resmi');
    const urunListelemeAlani = document.getElementById('urun-listeleme-alani');
    const urunListesiContainer = document.getElementById('urun-listesi-container');
    const kategoriBaslik = urunListelemeAlani.querySelector('h2');
    const siparisListesi = document.getElementById('siparis-listesi');
    const tamamlaBtn = document.getElementById('tamamla-btn');
    const siparisler = {}; // Siparişleri tutacak nesne

    const urunModal = document.getElementById('modal');
    const tamamlamaModal = document.getElementById('tamamlama-modal');
    const tamamlamaListesi = document.getElementById('tamamlama-listesi');
    const onaylaBtn = document.getElementById('onayla-btn');
    
    // Google Form bağlantısı
    const googleFormLink = "https://docs.google.com/forms/d/e/1FAIpQLSeOgmoe6PxEk6IMV-ipL5HapPz4STqi9muOiEidm1kfzz3eaw/viewform";

    // Kategori menülerini dinleme
    document.querySelectorAll('header nav ul li a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const kategori = e.target.dataset.kategori;
            const baslik = e.target.innerText;
            
            anaSayfaResmi.style.display = 'none';
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
        
        // Dinamik olarak eklenen ürünlere tıklama olayını bağlama
        document.querySelectorAll('.urun').forEach(urun => {
            urun.addEventListener('click', (e) => {
                const urunId = e.currentTarget.dataset.id;
                const secilenUrun = urunVerileri.find(u => u.id == urunId);
                
                document.getElementById('modal-urun-adi').innerText = secilenUrun.ad;
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

        if (document.querySelector('.tab-btn.active').dataset.tab === 'adet') {
            miktar = document.getElementById('adet-input').value;
            birim = "Adet";
        } else {
            miktar = document.getElementById('kilo-input').value;
            birim = "Kilo";
        }

        if (miktar && miktar > 0) {
            if (siparisler[urunId]) {
                siparisler[urunId].miktar = parseFloat(siparisler[urunId].miktar) + parseFloat(miktar);
            } else {
                siparisler[urunId] = {
                    ad: secilenUrun.ad,
                    miktar: parseFloat(miktar),
                    birim: birim
                };
            }
            
            siparisListesiniGuncelle();
            
            urunModal.style.display = 'none';
        } else {
            alert('Lütfen geçerli bir miktar girin.');
        }
    });

    // Sipariş listesini güncelleyen fonksiyon
    function siparisListesiniGuncelle() {
        siparisListesi.innerHTML = '';
        const siparisKeys = Object.keys(siparisler);
        if (siparisKeys.length > 0) {
            tamamlaBtn.style.display = 'block';
            siparisKeys.forEach(urunId => {
                const siparis = siparisler[urunId];
                const yeniSiparis = document.createElement('li');
                yeniSiparis.innerHTML = `${siparis.ad} - ${siparis.miktar} ${siparis.birim}`;
                siparisListesi.appendChild(yeniSiparis);
            });
        } else {
            tamamlaBtn.style.display = 'none';
        }
    }

    // Siparişi Tamamla butonu
    tamamlaBtn.addEventListener('click', () => {
        tamamlamaListesi.innerHTML = '';
        const siparisKeys = Object.keys(siparisler);
        siparisKeys.forEach(urunId => {
            const siparis = siparisler[urunId];
            const siparisItem = document.createElement('li');
            siparisItem.innerText = `${siparis.ad}: ${siparis.miktar} ${siparis.birim}`;
            tamamlamaListesi.appendChild(siparisItem);
        });
        tamamlamaModal.style.display = 'block';
    });
    
    // Onayla butonu (Google Form'a yönlendirme)
    onaylaBtn.addEventListener('click', () => {
        window.open(googleFormLink, '_blank');
        tamamlamaModal.style.display = 'none';
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