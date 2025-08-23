import requests
import csv
import io
import json
from typing import List, Dict, Any

def process_google_sheets_data(csv_content: str) -> List[Dict[str, Any]]:
    """
    Process Google Sheets CSV content into volleyball tournament data
    """
    teams = []
    
    # Parse CSV content
    csv_reader = csv.DictReader(io.StringIO(csv_content))
    
    for row in csv_reader:
        # Skip empty rows
        if not any(row.values()):
            continue
            
        # Extract team data from row
        team_data = {
            'name': row.get('팀명', '').strip(),
            'division': row.get('부별', '').strip(),
            'region': row.get('지역', '').strip(),
            'wins': int(row.get('우승', '0') or '0'),
            'runnerUp': int(row.get('준우승', '0') or '0'),
            'third': int(row.get('3위', '0') or '0'),
            'coach': row.get('감독', '').strip(),
            'mvp': row.get('최우수선수', '').strip(),
            'tournaments': int(row.get('참가대회수', '1') or '1')
        }
        
        # Calculate total medals and score
        team_data['totalMedals'] = team_data['wins'] + team_data['runnerUp'] + team_data['third']
        team_data['score'] = team_data['wins'] * 3 + team_data['runnerUp'] * 2 + team_data['third'] * 1
        
        # Map region if needed
        region_mapping = {
            '서울': '수도권',
            '경기': '수도권',
            '인천': '수도권',
            '부산': '경상권',
            '대구': '경상권',
            '울산': '경상권',
            '경남': '경상권',
            '경북': '경상권',
            '광주': '전라권',
            '전남': '전라권',
            '전북': '전라권',
            '대전': '충청권',
            '충남': '충청권',
            '충북': '충청권',
            '강원': '강원권',
            '제주': '제주권'
        }
        
        # Auto-detect region from team name if not provided
        if not team_data['region']:
            for city, region in region_mapping.items():
                if city in team_data['name']:
                    team_data['region'] = region
                    break
            else:
                team_data['region'] = '기타'
        
        teams.append(team_data)
    
    # Sort teams by score (descending)
    teams.sort(key=lambda x: (-x['score'], -x['wins'], -x['runnerUp'], -x['third']))
    
    # Add rankings
    for i, team in enumerate(teams):
        team['rank'] = i + 1
    
    return teams

def fetch_google_sheets_csv(sheet_id: str) -> str:
    """
    Try multiple methods to fetch Google Sheets data
    """
    urls_to_try = [
        f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv",
        f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid=0",
        f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv"
    ]
    
    for url in urls_to_try:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200 and response.text.strip():
                print(f"[v0] Successfully fetched data from: {url}")
                return response.text
        except Exception as e:
            print(f"[v0] Failed to fetch from {url}: {e}")
            continue
    
    return ""

# Try to fetch the data
sheet_id = "1uZ6kvG5L6T_wzLfj0KHDpU-7bK6pMbHHHWJe8IutIFs"
csv_content = fetch_google_sheets_csv(sheet_id)

if csv_content:
    teams = process_google_sheets_data(csv_content)
    print(f"[v0] Processed {len(teams)} teams from Google Sheets")
    
    # Save processed data
    with open('processed_teams.json', 'w', encoding='utf-8') as f:
        json.dump(teams, f, ensure_ascii=False, indent=2)
    
    print("[v0] Teams data saved to processed_teams.json")
else:
    print("[v0] Could not fetch Google Sheets data. Please try:")
    print("1. Make sure the sheet is publicly accessible")
    print("2. Copy and paste the data directly")
    print("3. Download as CSV and upload the file")
