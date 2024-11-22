import re
import requests

# TMDb API bilgisi (kendi anahtarınızı alın: https://www.themoviedb.org/settings/api)
API_KEY = "427f323096cbf6058c47782c87e83069"

def parse_file_name(file_name):
    """
    Medya dosyasının adını çözümleyerek dizi/film adı, sezon ve bölüm bilgisi çıkarır.
    """
    # Örnek dosya adı formatları:
    # Breaking.Bad.S01E01.1080p.mkv
    # Game.of.Thrones.S08E03.720p.mp4
    pattern = r"(?P<name>.+?)\.S(?P<season>\d+)E(?P<episode>\d+)"
    match = re.search(pattern, file_name, re.IGNORECASE)
    if match:
        return {
            "name": match.group("name").replace(".", " ").strip(),
            "season": int(match.group("season")),
            "episode": int(match.group("episode")),
        }
    return None

def fetch_metadata(name):
    """
    TMDb API üzerinden dizi/film bilgilerini çeker.
    """
    url = f"https://api.themoviedb.org/3/search/tv"
    params = {"api_key": API_KEY, "query": name}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data["results"]:
            return data["results"][0]  # İlk eşleşmeyi döndür
    return None

def fetch_episode_details(show_id, season_number, episode_number):
    """
    Belirli bir sezon ve bölüm numarası için bölüm bilgilerini çeker.
    """
    url = f"https://api.themoviedb.org/3/tv/{show_id}/season/{season_number}/episode/{episode_number}"
    params = {"api_key": API_KEY}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    return None

def main():
    file_name = "Breaking.Bad.S01E07.1080p.mkv"  # Örnek dosya adı
    parsed = parse_file_name(file_name)
    
    if parsed:
        print(f"Dosya Adı Çözümleme: {parsed}")
        metadata = fetch_metadata(parsed["name"])
        if metadata:
            print("\nBulunan Dizi Bilgileri:")
            print(f"Adı: {metadata['name']}")
            print(f"Özet: {metadata['overview']}")
            print(f"İlk Yayın Tarihi: {metadata['first_air_date']}")
            print(f"Popülerlik: {metadata['popularity']}")

            # Bölüm bilgilerini al
            show_id = metadata['id']
            episode_details = fetch_episode_details(show_id, parsed['season'], parsed['episode'])

            if episode_details:
                print(f"\nSezon {parsed['season']}, Bölüm {parsed['episode']} Bilgileri:")
                print(f"Bölüm Adı: {episode_details['name']}")
                print(f"Özet: {episode_details['overview']}")
                print(f"Yayın Tarihi: {episode_details['air_date']}")
        else:
            print("Dizi bilgileri bulunamadı.")
    else:
        print("Dosya adı çözümlemesi başarısız.")

if __name__ == "__main__":
    main()
