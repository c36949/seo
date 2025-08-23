import requests
import csv
import json
from io import StringIO
from collections import defaultdict

def fetch_csv_data(url):
    """Fetch CSV data from URL"""
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"[v0] Error fetching {url}: {e}")
        return None

def parse_csv_content(csv_content):
    """Parse CSV content and extract tournament data"""
    if not csv_content:
        return []
    
    try:
        # Handle different encodings
        csv_reader = csv.DictReader(StringIO(csv_content))
        results = []
        
        for row in csv_reader:
            # Clean up the row data
            cleaned_row = {}
            for key, value in row.items():
                if key and value:
                    # Handle Korean encoding issues
                    cleaned_key = key.strip()
                    cleaned_value = value.strip()
                    cleaned_row[cleaned_key] = cleaned_value
            
            if cleaned_row:
                results.append(cleaned_row)
        
        return results
    except Exception as e:
        print(f"[v0] Error parsing CSV: {e}")
        return []

def process_tournament_data(tournament_results, tournament_name):
    """Process tournament results and extract team rankings"""
    teams_data = []
    
    for result in tournament_results:
        # Extract key information from each row
        division = result.get('참가부별', result.get('부별', ''))
        ranking = result.get('순위', '')
        team_name = result.get('팀명', '')
        mvp = result.get('최우수선수', result.get('MVP', ''))
        coach = result.get('감독명', result.get('감독', ''))
        
        if team_name and division:
            # Determine region from team name
            region = determine_region(team_name)
            
            # Calculate points based on ranking
            points = calculate_points(ranking)
            
            team_data = {
                'team_name': team_name,
                'division': division,
                'region': region,
                'tournament': tournament_name,
                'ranking': ranking,
                'points': points,
                'mvp': mvp,
                'coach': coach
            }
            teams_data.append(team_data)
    
    return teams_data

def determine_region(team_name):
    """Determine region based on team name"""
    region_keywords = {
        '수도권': ['서울', '인천', '경기', '고양', '성남', '수원', '안산', '부천', '의정부', '안양', '평택', '시흥', '파주', '김포', '광명', '광주', '하남', '오산', '구리', '남양주', '용인', '화성', '안성', '의왕', '군포', '양주', '포천', '여주', '연천', '가평', '양평'],
        '강원권': ['춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '횡성', '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양'],
        '충청권': ['대전', '세종', '청주', '충주', '제천', '보은', '옥천', '영동', '진천', '괴산', '음성', '단양', '증평', '천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진', '금산', '부여', '서천', '청양', '홍성', '예산', '태안'],
        '전라권': ['광주', '전주', '군산', '익산', '정읍', '남원', '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안', '목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안'],
        '경상권': ['부산', '대구', '울산', '창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천', '포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산', '군위', '의성', '청송', '영양', '영덕', '청도', '고령', '성주', '칠곡', '예천', '봉화', '울진', '울릉'],
        '제주권': ['제주', '서귀포']
    }
    
    for region, keywords in region_keywords.items():
        for keyword in keywords:
            if keyword in team_name:
                return region
    
    return '기타'

def calculate_points(ranking):
    """Calculate points based on ranking"""
    if not ranking:
        return 0
    
    try:
        if '우승' in ranking or '1' in ranking:
            return 100
        elif '준우승' in ranking or '2' in ranking:
            return 80
        elif '3위' in ranking or '3' in ranking:
            return 60
        elif '4위' in ranking or '4' in ranking:
            return 40
        elif '5위' in ranking or '5' in ranking:
            return 30
        elif '6위' in ranking or '6' in ranking:
            return 20
        elif '7위' in ranking or '7' in ranking:
            return 15
        elif '8위' in ranking or '8' in ranking:
            return 10
        else:
            return 5  # Participation points
    except:
        return 5

# Tournament URLs and names
tournaments = [
    {
        'name': '제7회 남원춘향배 전국남녀 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C7%ED%9A%8C%20%EB%82%A8%EC%9B%90%EC%B6%98%ED%96%A5%EB%B0%B0%20%EC%A0%84%EA%B5%AD%EB%82%A8%EB%85%80%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-gbTRancYlrRN1zgOV5dJsGmNNpOzHX.csv'
    },
    {
        'name': '제18회고흥우주항공배생활체육동호인배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C18%ED%9A%8C%EA%B3%A0%ED%9D%A5%EC%9A%B0%EC%A3%BC%ED%95%AD%EA%B3%B5%EB%B0%B0%EC%83%9D%ED%99%9C%EC%B2%B4%EC%9C%A1%EB%8F%99%ED%98%B8%EC%9D%B8%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-isT15Qy0Ke2njKbKIBKrjbCmxH55ph.csv'
    },
    {
        'name': '제7회 선비배 전국 남녀 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C7%ED%9A%8C%20%EC%84%A0%EB%B9%84%EB%B0%B0%20%EC%A0%84%EA%B5%AD%20%EB%82%A8%EB%85%80%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-l1kST2WFp6A2zrvycooOWn5Hac8kMg.csv'
    },
    {
        'name': '2025년 안산 상록수 9인제 남·여 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2025%EB%85%84%20%EC%95%88%EC%82%B0%20%EC%83%81%EB%A1%9D%EC%88%98%209%EC%9D%B8%EC%A0%9C%20%EB%82%A8%C2%B7%EC%97%AC%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-hDpoSIPhCFRcnqZypYEyHOVg4cS3yL.csv'
    },
    {
        'name': '제36회 해림배 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C36%ED%9A%8C%20%ED%95%B4%EB%A6%BC%EB%B0%B0%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-NgG4t6iJnqnRK9RF7T0IRaoI0RIWXV.csv'
    },
    {
        'name': '제3회 청풍명월 의림지배 전국 생활체육 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C3%ED%9A%8C%20%EC%B2%AD%ED%92%8D%EB%AA%85%EC%9B%94%20%EC%9D%98%EB%A6%BC%EC%A7%80%EB%B0%B0%20%EC%A0%84%EA%B5%AD%20%EC%83%9D%ED%99%9C%EC%B2%B4%EC%9C%A1%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-m0OJzhbkNwBAPiiRSsB1r0mxCHdH7a.csv'
    },
    {
        'name': '제19회 문화체육관광부장관기 전국생활체육배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C19%ED%9A%8C%20%EB%AC%B8%ED%99%94%EC%B2%B4%EC%9C%A1%EA%B4%80%EA%B4%91%EB%B6%80%EC%9E%A5%EA%B4%80%EA%B8%B0%20%EC%A0%84%EA%B5%AD%EC%83%9D%ED%99%9C%EC%B2%B4%EC%9C%A1%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-Z14McG1ZXRXsu5c7YmIW2cuqN1npZd.csv'
    },
    {
        'name': '제2회 영양 별천지배 스포츠클럽 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C2%ED%9A%8C%20%EC%98%81%EC%96%91%20%EB%B3%84%EC%B2%9C%EC%A7%80%EB%B0%B0%20%EC%8A%A4%ED%8F%AC%EC%B8%A0%ED%81%B4%EB%9F%BD%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-DmKc4YDXXoCkh7l7PsR651ji3QITL4.csv'
    },
    {
        'name': '제12회 순창장류배전국남여배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C12%ED%9A%8C%20%EC%88%9C%EC%B0%BD%EC%9E%A5%EB%A5%98%EB%B0%B0%EC%A0%84%EA%B5%AD%EB%82%A8%EC%97%AC%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-rpgcKmVjYGvCMd1kMqtJ93HuBTy5Bw.csv'
    },
    {
        'name': '제17회 홍천무궁화배 전국생활체육 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C17%ED%9A%8C%20%ED%99%8D%EC%B2%9C%EB%AC%B4%EA%B6%81%ED%99%94%EB%B0%B0%20%EC%A0%84%EA%B5%AD%EC%83%9D%ED%99%9C%EC%B2%B4%EC%9C%A1%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-xPqXITUUyCz9cl0h79R4sqQHZ6wP5w.csv'
    },
    {
        'name': '2025 고창군수배 전국 남녀배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2025%20%EA%B3%A0%EC%B0%BD%EA%B5%B0%EC%88%98%EB%B0%B0%20%EC%A0%84%EA%B5%AD%20%EB%82%A8%EC%97%AC%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-kOIWJ40YORr8PEj5QNcZ3fdQv1SwrO.csv'
    },
    {
        'name': '제 17회 용인특례시 경기일보 전국 남.녀 생활체육배구대',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C%2017%ED%9A%8C%20%EC%9A%A9%EC%9D%B8%ED%8A%B9%EB%A1%80%EC%8B%9C%20%EA%B2%BD%EA%B8%B0%EC%9D%BC%EB%B3%B4%20%EC%A0%84%EA%B5%AD%20%EB%82%A8.%EB%85%80%20%EC%83%9D%ED%99%9C%EC%B2%B4%EC%9C%A1%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-a2bW2VioPDWT1JEEDzeSPfcK2LXHnI.csv'
    },
    {
        'name': '제3회 단양 만천하 스카이배 스포츠클럽 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C3%ED%9A%8C%20%EB%8B%A8%EC%96%91%20%EB%A7%8C%EC%B2%9C%ED%95%98%20%EC%8A%A4%EC%B9%B4%EC%9D%B4%EB%B0%B0%20%EC%8A%A4%ED%8F%AC%EC%B8%A0%ED%81%B4%EB%9F%BD%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-U7t0VhcN4wGgA9FxjWCVKnoCI1ZHMY.csv'
    },
    {
        'name': '제19회 한산대첩기 전국남녀생활체육배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C19%ED%9A%8C%20%ED%95%9C%EC%82%B0%EB%8C%80%EC%B2%A9%EA%B8%B0%20%EC%A0%84%EA%B5%AD%EB%82%A8%EB%85%80%EC%83%9D%ED%99%9C%EC%B2%B4%EC%9C%A1%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-uJG0mKdWoyl3TwMZ5kStJtozcU5Zgy.csv'
    },
    {
        'name': '제5회 강진청자배 전국 남·녀 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C5%ED%9A%8C%20%EA%B0%95%EC%A7%84%EC%B2%AD%EC%9E%90%EB%B0%B0%20%EC%A0%84%EA%B5%AD%20%EB%82%A8%C2%B7%EB%85%80%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-dp5xqPvWuSwXj4jbN8XQRLixM0mqOM.csv'
    },
    {
        'name': '제9회기장미역다시마배전국남.여배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C9%ED%9A%8C%EA%B8%B0%EC%9E%A5%EB%AF%B8%EC%97%AD%EB%8B%A4%EC%8B%9C%EB%A7%88%EB%B0%B0%EC%A0%84%EA%B5%AD%EB%82%A8.%EC%97%AC%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-SzVHfWiybyQN1N256d5ZiARiYntlvn.csv'
    },
    {
        'name': '제131주년 동학농민혁명기념 전국 남‧여 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C131%EC%A3%BC%EB%85%84%20%EB%8F%99%ED%95%99%EB%86%8D%EB%AF%BC%ED%98%81%EB%AA%85%EA%B8%B0%EB%85%90%20%EC%A0%84%EA%B5%AD%20%EB%82%A8%E2%80%A7%EC%97%AC%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-6SUPUsk8UcjjahWGrrA9wsnqrUvMeK.csv'
    },
    {
        'name': '제2회보성녹차배 전국남여배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C2%ED%9A%8C%EB%B3%B4%EC%84%B1%EB%85%B9%EC%B0%A8%EB%B0%B0%20%EC%A0%84%EA%B5%AD%EB%82%A8%EC%97%AC%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-KzJEHpZqOHReeXyboljfrz2vO4jdQ4.csv'
    },
    {
        'name': '제61회 박계조배 전국9인제 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C61%ED%9A%8C%20%EB%B0%95%EA%B3%84%EC%A1%B0%EB%B0%B0%20%EC%A0%84%EA%B5%AD9%EC%9D%B8%EC%A0%9C%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-ztX7MR1uUAaAnSZmh7ZS04XctmJ0IJ.csv'
    },
    {
        'name': 'BIG5 스포츠페스타 in 부산 2025 부산광역시장배',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BIG5%20%EC%8A%A4%ED%8F%AC%EC%B8%A0%ED%8E%98%EC%8A%A4%ED%83%80%20in%20%EB%B6%80%EC%82%B0%202025%20%EB%B6%80%EC%82%B0%EA%B4%91%EC%97%AD%EC%8B%9C%EC%9E%A5%EB%B0%B0-DCEpOmzB0GagzWiUIRafSM1TivI2Bk.csv'
    },
    {
        'name': '제53회 생활체육 카네이션 전국 어머니배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C53%ED%9A%8C%20%EC%83%9D%ED%99%9C%EC%B2%B4%EC%9C%A1%20%EC%B9%B4%EB%84%A4%EC%9D%B4%EC%85%98%20%EC%A0%84%EA%B5%AD%20%EC%96%B4%EB%A8%B8%EB%8B%88%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-iSjAKQ8NQckgAVYWfE7cu0aKYjh1tb.csv'
    },
    {
        'name': '제13회 진해군항제기념 전국남여배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C13%ED%9A%8C%20%EC%A7%84%ED%95%B4%EA%B5%B0%ED%95%AD%EC%A0%9C%EA%B8%B0%EB%85%90%20%EC%A0%84%EA%B5%AD%EB%82%A8%EC%97%AC%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-34cAhx0RqPP5bcUgBTcFKMHUCTxjtX.csv'
    },
    {
        'name': '제16회 순천만갈대배 전국 남·여 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C16%ED%9A%8C%20%EC%88%9C%EC%B2%9C%EB%A7%8C%EA%B0%88%EB%8C%80%EB%B0%B0%20%EC%A0%84%EA%B5%AD%20%EB%82%A8%C2%B7%EC%97%AC%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-4uQyojeX3yi1dNB5in7NjFAspsOMnR.csv'
    },
    {
        'name': '제1회 횡성한우배 전국 남.여배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C1%ED%9A%8C%20%ED%9A%A1%EC%84%B1%ED%95%9C%EC%9A%B0%EB%B0%B0%20%EC%A0%84%EA%B5%AD%20%EB%82%A8.%EC%97%AC%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-46jG0O9KDyst8cmfVR2WdXVjS4KqMO.csv'
    },
    {
        'name': '2025 청양칠갑산배 전국남여배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2025%20%EC%B2%AD%EC%96%91%EC%B9%A0%EA%B0%88%EC%82%B0%EB%B0%B0%20%EC%A0%84%EA%B5%AD%EB%82%A8%EC%97%AC%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-Q1QCUolVmEstdI3Sf2YAYzt2jgZ1IQ.csv'
    },
    {
        'name': '제4회단양도담삼봉배스포츠클럽전국배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C4%ED%9A%8C%EB%8B%A8%EC%96%91%EB%8F%84%EB%8B%B4%EC%82%BC%EB%B4%89%EB%B0%B0%EC%8A%A4%ED%8F%AC%EC%B8%A0%ED%81%B4%EB%9F%BD%EC%A0%84%EA%B5%AD%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-h5mLZ9t4HrxgM0BkggrMbrZGzECuUZ.csv'
    },
    {
        'name': '제23회 나주 배꽃배 전국남여배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C23%ED%9A%8C%20%EB%82%98%EC%A3%BC%20%EB%B0%B0%EA%BD%83%EB%B0%B0%20%EC%A0%84%EA%B5%AD%EB%82%A8%EC%97%AC%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-YGk3yp8NYDOca7bw5uLxHwqh1ln7cZ.csv'
    },
    {
        'name': '제18회 광양백운산기 전국 남여배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C18%ED%9A%8C%20%EA%B4%91%EC%96%91%EB%B0%B1%EC%9A%B4%EC%82%B0%EA%B8%B0%20%EC%A0%84%EA%B5%AD%20%EB%82%A8%EC%97%AC%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-ixSP8H14Et0LmvgHttmEb78JUq25XO.csv'
    },
    {
        'name': '제2회  빛고을 무등산배 전국생활체육배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C2%ED%9A%8C%20%20%EB%B9%9B%EA%B3%A0%EC%9D%84%20%EB%AC%B4%EB%93%B1%EC%82%B0%EB%B0%B0%20%EC%A0%84%EA%B5%AD%EC%83%9D%ED%99%9C%EC%B2%B4%EC%9C%A1%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-VD622Ra69PqHMJzm8btF2eTyqfMmVX.csv'
    },
    {
        'name': '제6회 단양소백산배 전국9인제배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C6%ED%9A%8C%20%EB%8B%A8%EC%96%91%EC%86%8C%EB%B0%B1%EC%82%B0%EB%B0%B0%20%EC%A0%84%EA%B5%AD9%EC%9D%B8%EC%A0%9C%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-53bN21ZsLek9ULcvUtfFEKEt4pbNz9.csv'
    },
    {
        'name': '제3회 인제 내린천배 한국9인제 배구 챔피언쉽 배구대회',
        'url': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%9C3%ED%9A%8C%20%EC%9D%B8%EC%A0%9C%20%EB%82%B4%EB%A6%B0%EC%B2%9C%EB%B0%B0%20%ED%95%9C%EA%B5%AD9%EC%9D%B8%EC%A0%9C%20%EB%B0%B0%EA%B5%AC%20%EC%B1%94%ED%94%BC%EC%96%B8%EC%89%BD%20%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C-7VvmIAO2fc5G1UL8CS1xdyzCyw3jKq.csv'
    }
]

# Process all tournaments
all_teams_data = []
tournament_summary = {}

print("[v0] Starting to process tournaments...")

for tournament in tournaments:
    print(f"[v0] Processing: {tournament['name']}")
    
    # Fetch CSV data
    csv_content = fetch_csv_data(tournament['url'])
    
    if csv_content:
        # Parse CSV content
        tournament_results = parse_csv_content(csv_content)
        
        # Process tournament data
        teams_data = process_tournament_data(tournament_results, tournament['name'])
        
        all_teams_data.extend(teams_data)
        tournament_summary[tournament['name']] = len(teams_data)
        
        print(f"[v0] Processed {len(teams_data)} teams from {tournament['name']}")
    else:
        print(f"[v0] Failed to fetch data for {tournament['name']}")

# Aggregate team statistics
team_stats = defaultdict(lambda: {
    'total_points': 0,
    'tournaments': [],
    'wins': 0,
    'second_places': 0,
    'third_places': 0,
    'total_tournaments': 0,
    'division': '',
    'region': '',
    'mvp_awards': [],
    'coaches': []
})

for team_data in all_teams_data:
    team_name = team_data['team_name']
    stats = team_stats[team_name]
    
    stats['total_points'] += team_data['points']
    stats['tournaments'].append({
        'name': team_data['tournament'],
        'ranking': team_data['ranking'],
        'points': team_data['points']
    })
    stats['total_tournaments'] += 1
    stats['division'] = team_data['division']
    stats['region'] = team_data['region']
    
    if team_data['mvp']:
        stats['mvp_awards'].append(team_data['mvp'])
    
    if team_data['coach']:
        stats['coaches'].append(team_data['coach'])
    
    # Count medal types
    ranking = team_data['ranking']
    if '우승' in ranking or '1' in ranking:
        stats['wins'] += 1
    elif '준우승' in ranking or '2' in ranking:
        stats['second_places'] += 1
    elif '3위' in ranking or '3' in ranking:
        stats['third_places'] += 1

# Convert to final format and sort by total points
final_rankings = []
for team_name, stats in team_stats.items():
    final_rankings.append({
        'team_name': team_name,
        'total_points': stats['total_points'],
        'wins': stats['wins'],
        'second_places': stats['second_places'],
        'third_places': stats['third_places'],
        'total_tournaments': stats['total_tournaments'],
        'division': stats['division'],
        'region': stats['region'],
        'tournaments': stats['tournaments'],
        'mvp_awards': list(set(stats['mvp_awards'])),
        'coaches': list(set(stats['coaches']))
    })

# Sort by total points (descending)
final_rankings.sort(key=lambda x: x['total_points'], reverse=True)

# Print summary
print(f"\n[v0] Tournament Processing Complete!")
print(f"[v0] Total teams processed: {len(final_rankings)}")
print(f"[v0] Total tournaments: {len(tournaments)}")

# Print top 10 teams
print(f"\n[v0] Top 10 Teams:")
for i, team in enumerate(final_rankings[:10], 1):
    print(f"{i}. {team['team_name']} ({team['division']}) - {team['total_points']} points")

def generate_division_rankings(final_rankings):
    """Generate rankings by division"""
    division_rankings = defaultdict(list)
    
    for team in final_rankings:
        division = team['division']
        if division:
            division_rankings[division].append(team)
    
    # Sort each division by total points
    for division in division_rankings:
        division_rankings[division].sort(key=lambda x: x['total_points'], reverse=True)
    
    return dict(division_rankings)

def generate_regional_rankings(final_rankings):
    """Generate rankings by region"""
    regional_rankings = defaultdict(list)
    
    for team in final_rankings:
        region = team['region']
        if region:
            regional_rankings[region].append(team)
    
    # Sort each region by total points
    for region in regional_rankings:
        regional_rankings[region].sort(key=lambda x: x['total_points'], reverse=True)
    
    return dict(regional_rankings)

division_rankings = generate_division_rankings(final_rankings)
regional_rankings = generate_regional_rankings(final_rankings)

# Print division summary
print(f"\n[v0] Division Rankings Summary:")
for division, teams in division_rankings.items():
    print(f"{division}: {len(teams)} teams")
    if teams:
        print(f"  1위: {teams[0]['team_name']} ({teams[0]['total_points']} points)")

# Print regional summary
print(f"\n[v0] Regional Rankings Summary:")
for region, teams in regional_rankings.items():
    print(f"{region}: {len(teams)} teams")
    if teams:
        print(f"  1위: {teams[0]['team_name']} ({teams[0]['total_points']} points)")

# Save results to JSON file
output_data = {
    'tournaments': tournament_summary,
    'teams': final_rankings,
    'division_rankings': division_rankings,
    'regional_rankings': regional_rankings,
    'total_teams': len(final_rankings),
    'total_tournaments': len(tournaments)
}

with open('tournament_results.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print(f"\n[v0] Results saved to tournament_results.json")
