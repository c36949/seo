import requests
import csv
import json
from io import StringIO

def fetch_and_process_complete_results():
    """Fetch and process the complete tournament results CSV"""
    
    # CSV URL provided by user
    csv_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A0%84%EA%B5%AD%20%EB%B0%B0%EA%B5%AC%20%EB%8C%80%ED%9A%8C%20%EA%B2%B0%EA%B3%BC%ED%91%9C-ELTeTH3Ya4b6YTihaYGcbwC9xVLnw8.csv"
    
    try:
        # Fetch the CSV data
        response = requests.get(csv_url)
        response.encoding = 'utf-8'
        
        if response.status_code == 200:
            # Parse CSV content
            csv_content = StringIO(response.text)
            reader = csv.DictReader(csv_content)
            
            all_teams = []
            divisions = set()
            regions = set()
            
            # Process each row to extract all team data
            for row in reader:
                # Extract team information from each row
                division = row.get('대회부별', '').strip()
                team_name = row.get('팀명', '').strip()
                main_region = row.get('주요지역별', '').strip()
                detailed_region = row.get('세부지역', '').strip()
                
                if team_name and division:
                    divisions.add(division)
                    regions.add(main_region)
                    
                    # Create comprehensive team record
                    team_data = {
                        'name': team_name,
                        'division': division,
                        'main_region': main_region,
                        'detailed_region': detailed_region,
                        'gold_medals': 0,
                        'silver_medals': 0,
                        'bronze_medals': 0,
                        'total_score': 0,
                        'tournaments_participated': 1,
                        'achievements': []
                    }
                    
                    all_teams.append(team_data)
            
            # Group teams by division and calculate rankings
            division_rankings = {}
            for division in divisions:
                division_teams = [team for team in all_teams if team['division'] == division]
                
                # Sort by total score (you can adjust ranking logic)
                division_teams.sort(key=lambda x: (x['gold_medals'], x['silver_medals'], x['bronze_medals']), reverse=True)
                
                # Assign rankings
                for i, team in enumerate(division_teams):
                    team['division_rank'] = i + 1
                
                division_rankings[division] = division_teams
            
            # Generate comprehensive results
            results = {
                'total_teams': len(all_teams),
                'divisions': list(divisions),
                'regions': list(regions),
                'division_rankings': division_rankings,
                'summary': {
                    'divisions_count': len(divisions),
                    'regions_count': len(regions),
                    'teams_per_division': {div: len(division_rankings[div]) for div in divisions}
                }
            }
            
            print(f"✅ Successfully processed {len(all_teams)} teams across {len(divisions)} divisions")
            print(f"📊 Teams per division: {results['summary']['teams_per_division']}")
            
            return results
            
        else:
            print(f"❌ Failed to fetch CSV: HTTP {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error processing CSV: {str(e)}")
        return None

# Execute the processing
if __name__ == "__main__":
    results = fetch_and_process_complete_results()
    if results:
        # Save results to JSON for use in the app
        with open('complete_volleyball_data.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print("💾 Data saved to complete_volleyball_data.json")
