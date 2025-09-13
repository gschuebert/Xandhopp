<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\UsState;
use App\Entity\UsStateMetric;
use App\Repository\UsStateRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:add:us-state-metrics', description: 'Add special metrics and cultural data for US states')]
class AddUsStateMetricsCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UsStateRepository $stateRepository,
        private \App\Repository\SourceRepository $sourceRepository
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('state', null, InputOption::VALUE_OPTIONAL, 'Add metrics for specific state by code (e.g., TX)')
            ->addOption('limit', null, InputOption::VALUE_OPTIONAL, 'Limit number of states to process', '50');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Adding US State Metrics');

        $source = $this->sourceRepository->findOneBy(['key' => 'wikipedia']);
        if (!$source) {
            $io->error('Wikipedia source not found');
            return Command::FAILURE;
        }

        $stateCode = $input->getOption('state');
        $limit = (int) $input->getOption('limit');

        if ($stateCode) {
            $states = [$this->stateRepository->findByStateCode($stateCode)];
            $states = array_filter($states);
        } else {
            $states = $this->stateRepository->findAllOrderedByName();
            $states = array_slice($states, 0, $limit);
        }

        if (empty($states)) {
            $io->error('No states found to enhance');
            return Command::FAILURE;
        }

        $enhanced = 0;

        foreach ($states as $state) {
            $io->section("Adding metrics for {$state->getNameEn()} ({$state->getStateCode()})");

            try {
                $metrics = $this->getStateMetrics($state->getStateCode());
                
                foreach ($metrics as $metricKey => $metricValue) {
                    $this->addMetric($state, $metricKey, $metricValue, $source);
                    $io->writeln("  ✅ Added {$metricKey}: {$metricValue}");
                }

                $this->em->flush();
                $enhanced++;
                $io->writeln("  🎉 Enhanced {$state->getNameEn()}");

            } catch (\Throwable $e) {
                $io->writeln("  ❌ Error enhancing {$state->getNameEn()}: " . $e->getMessage());
            }
        }

        $io->success("Metrics addition completed! Enhanced: {$enhanced}");
        return Command::SUCCESS;
    }

    private function getStateMetrics(string $stateCode): array
    {
        $metrics = [
            'AL' => [
                'famous_food' => 'Fried chicken, barbecue, pecan pie',
                'famous_landmark' => 'USS Alabama Battleship Memorial Park',
                'famous_person' => 'Rosa Parks, Helen Keller, Hank Williams',
                'state_motto' => 'Audemus jura nostra defendere (We dare defend our rights)',
                'state_flower' => 'Camellia',
                'state_bird' => 'Yellowhammer',
                'state_tree' => 'Southern Longleaf Pine',
                'nickname' => 'The Heart of Dixie',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'AK' => [
                'famous_food' => 'Salmon, reindeer sausage, wild berries',
                'famous_landmark' => 'Denali National Park, Northern Lights',
                'famous_person' => 'Sarah Palin, Jewel, Susan Butcher',
                'state_motto' => 'North to the Future',
                'state_flower' => 'Forget-me-not',
                'state_bird' => 'Willow Ptarmigan',
                'state_tree' => 'Sitka Spruce',
                'nickname' => 'The Last Frontier',
                'time_zone' => 'Alaska Time',
                'driving_side' => 'Right'
            ],
            'AZ' => [
                'famous_food' => 'Sonoran hot dogs, chimichangas, prickly pear',
                'famous_landmark' => 'Grand Canyon, Monument Valley',
                'famous_person' => 'Barry Goldwater, Sandra Day O\'Connor, Cesar Chavez',
                'state_motto' => 'Ditat Deus (God enriches)',
                'state_flower' => 'Saguaro Cactus Blossom',
                'state_bird' => 'Cactus Wren',
                'state_tree' => 'Palo Verde',
                'nickname' => 'The Grand Canyon State',
                'time_zone' => 'Mountain Time',
                'driving_side' => 'Right'
            ],
            'AR' => [
                'famous_food' => 'Fried catfish, rice, barbecue',
                'famous_landmark' => 'Hot Springs National Park, Crystal Bridges',
                'famous_person' => 'Bill Clinton, Johnny Cash, Maya Angelou',
                'state_motto' => 'Regnat Populus (The people rule)',
                'state_flower' => 'Apple Blossom',
                'state_bird' => 'Mockingbird',
                'state_tree' => 'Pine',
                'nickname' => 'The Natural State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'CA' => [
                'famous_food' => 'Avocado toast, fish tacos, sourdough bread',
                'famous_landmark' => 'Golden Gate Bridge, Hollywood Sign, Yosemite',
                'famous_person' => 'Arnold Schwarzenegger, Steve Jobs, Oprah Winfrey',
                'state_motto' => 'Eureka (I have found it)',
                'state_flower' => 'California Poppy',
                'state_bird' => 'California Quail',
                'state_tree' => 'California Redwood',
                'nickname' => 'The Golden State',
                'time_zone' => 'Pacific Time',
                'driving_side' => 'Right'
            ],
            'CO' => [
                'famous_food' => 'Rocky Mountain oysters, green chile, craft beer',
                'famous_landmark' => 'Rocky Mountain National Park, Garden of the Gods',
                'famous_person' => 'John Denver, Tim Allen, Trey Parker',
                'state_motto' => 'Nil sine numine (Nothing without providence)',
                'state_flower' => 'Rocky Mountain Columbine',
                'state_bird' => 'Lark Bunting',
                'state_tree' => 'Colorado Blue Spruce',
                'nickname' => 'The Centennial State',
                'time_zone' => 'Mountain Time',
                'driving_side' => 'Right'
            ],
            'CT' => [
                'famous_food' => 'New Haven pizza, lobster rolls, apple cider',
                'famous_landmark' => 'Yale University, Mystic Seaport',
                'famous_person' => 'Mark Twain, Katharine Hepburn, Meryl Streep',
                'state_motto' => 'Qui transtulit sustinet (He who transplanted still sustains)',
                'state_flower' => 'Mountain Laurel',
                'state_bird' => 'American Robin',
                'state_tree' => 'White Oak',
                'nickname' => 'The Constitution State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'DE' => [
                'famous_food' => 'Scrapple, blue crabs, peach pie',
                'famous_landmark' => 'Dover Air Force Base, Brandywine Valley',
                'famous_person' => 'Joe Biden, Valerie Bertinelli, Ryan Phillippe',
                'state_motto' => 'Liberty and Independence',
                'state_flower' => 'Peach Blossom',
                'state_bird' => 'Blue Hen Chicken',
                'state_tree' => 'American Holly',
                'nickname' => 'The First State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'FL' => [
                'famous_food' => 'Key lime pie, Cuban sandwiches, gator tail',
                'famous_landmark' => 'Walt Disney World, Everglades, Kennedy Space Center',
                'famous_person' => 'Ernest Hemingway, Tom Petty, Tim Tebow',
                'state_motto' => 'In God We Trust',
                'state_flower' => 'Orange Blossom',
                'state_bird' => 'Northern Mockingbird',
                'state_tree' => 'Sabal Palm',
                'nickname' => 'The Sunshine State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'GA' => [
                'famous_food' => 'Peach cobbler, fried chicken, Vidalia onions',
                'famous_landmark' => 'Stone Mountain, Savannah Historic District',
                'famous_person' => 'Martin Luther King Jr., Jimmy Carter, Ray Charles',
                'state_motto' => 'Wisdom, Justice, and Moderation',
                'state_flower' => 'Cherokee Rose',
                'state_bird' => 'Brown Thrasher',
                'state_tree' => 'Live Oak',
                'nickname' => 'The Peach State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'HI' => [
                'famous_food' => 'Poke, spam musubi, shave ice',
                'famous_landmark' => 'Pearl Harbor, Diamond Head, Volcanoes National Park',
                'famous_person' => 'Barack Obama, Bruno Mars, Dwayne Johnson',
                'state_motto' => 'Ua Mau ke Ea o ka ʻĀina i ka Pono (The life of the land is perpetuated in righteousness)',
                'state_flower' => 'Hibiscus',
                'state_bird' => 'Nene',
                'state_tree' => 'Kukui',
                'nickname' => 'The Aloha State',
                'time_zone' => 'Hawaii Time',
                'driving_side' => 'Right'
            ],
            'ID' => [
                'famous_food' => 'Potatoes, huckleberries, trout',
                'famous_landmark' => 'Craters of the Moon, Shoshone Falls',
                'famous_person' => 'Sacajawea, Ezra Pound, Picabo Street',
                'state_motto' => 'Esto perpetua (Let it be perpetual)',
                'state_flower' => 'Syringa',
                'state_bird' => 'Mountain Bluebird',
                'state_tree' => 'Western White Pine',
                'nickname' => 'The Gem State',
                'time_zone' => 'Mountain Time',
                'driving_side' => 'Right'
            ],
            'IL' => [
                'famous_food' => 'Deep dish pizza, Chicago hot dogs, Italian beef',
                'famous_landmark' => 'Willis Tower, Millennium Park, Route 66',
                'famous_person' => 'Abraham Lincoln, Oprah Winfrey, Barack Obama',
                'state_motto' => 'State Sovereignty, National Union',
                'state_flower' => 'Violet',
                'state_bird' => 'Northern Cardinal',
                'state_tree' => 'White Oak',
                'nickname' => 'The Prairie State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'IN' => [
                'famous_food' => 'Pork tenderloin, sugar cream pie, corn',
                'famous_landmark' => 'Indianapolis Motor Speedway, Indiana Dunes',
                'famous_person' => 'Michael Jackson, David Letterman, Larry Bird',
                'state_motto' => 'The Crossroads of America',
                'state_flower' => 'Peony',
                'state_bird' => 'Northern Cardinal',
                'state_tree' => 'Tulip Tree',
                'nickname' => 'The Hoosier State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'IA' => [
                'famous_food' => 'Pork chops, sweet corn, loose meat sandwiches',
                'famous_landmark' => 'Field of Dreams, Amana Colonies',
                'famous_person' => 'John Wayne, Ashton Kutcher, Herbert Hoover',
                'state_motto' => 'Our liberties we prize and our rights we will maintain',
                'state_flower' => 'Wild Rose',
                'state_bird' => 'Eastern Goldfinch',
                'state_tree' => 'Oak',
                'nickname' => 'The Hawkeye State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'KS' => [
                'famous_food' => 'Barbecue, wheat, bison',
                'famous_landmark' => 'Flint Hills, Monument Rocks',
                'famous_person' => 'Amelia Earhart, Dwight D. Eisenhower, Langston Hughes',
                'state_motto' => 'Ad astra per aspera (To the stars through difficulties)',
                'state_flower' => 'Sunflower',
                'state_bird' => 'Western Meadowlark',
                'state_tree' => 'Cottonwood',
                'nickname' => 'The Sunflower State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'KY' => [
                'famous_food' => 'Bourbon, fried chicken, burgoo',
                'famous_landmark' => 'Mammoth Cave, Churchill Downs',
                'famous_person' => 'Muhammad Ali, Abraham Lincoln, Jennifer Lawrence',
                'state_motto' => 'United we stand, divided we fall',
                'state_flower' => 'Goldenrod',
                'state_bird' => 'Northern Cardinal',
                'state_tree' => 'Tulip Poplar',
                'nickname' => 'The Bluegrass State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'LA' => [
                'famous_food' => 'Gumbo, jambalaya, beignets',
                'famous_landmark' => 'French Quarter, Mardi Gras, Bayou',
                'famous_person' => 'Louis Armstrong, Fats Domino, Ellen DeGeneres',
                'state_motto' => 'Union, Justice, and Confidence',
                'state_flower' => 'Magnolia',
                'state_bird' => 'Brown Pelican',
                'state_tree' => 'Bald Cypress',
                'nickname' => 'The Pelican State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'ME' => [
                'famous_food' => 'Lobster, blueberry pie, whoopie pies',
                'famous_landmark' => 'Acadia National Park, Portland Head Light',
                'famous_person' => 'Stephen King, Anna Kendrick, Patrick Dempsey',
                'state_motto' => 'Dirigo (I lead)',
                'state_flower' => 'White Pine Cone and Tassel',
                'state_bird' => 'Chickadee',
                'state_tree' => 'Eastern White Pine',
                'nickname' => 'The Pine Tree State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'MD' => [
                'famous_food' => 'Blue crabs, crab cakes, Old Bay seasoning',
                'famous_landmark' => 'Chesapeake Bay, Fort McHenry',
                'famous_person' => 'Babe Ruth, Thurgood Marshall, Michael Phelps',
                'state_motto' => 'Fatti maschii, parole femine (Strong deeds, gentle words)',
                'state_flower' => 'Black-eyed Susan',
                'state_bird' => 'Baltimore Oriole',
                'state_tree' => 'White Oak',
                'nickname' => 'The Old Line State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'MA' => [
                'famous_food' => 'Clam chowder, Boston cream pie, lobster rolls',
                'famous_landmark' => 'Fenway Park, Harvard University, Plymouth Rock',
                'famous_person' => 'John F. Kennedy, Mark Wahlberg, Matt Damon',
                'state_motto' => 'Ense petit placidam sub libertate quietem (By the sword we seek peace, but peace only under liberty)',
                'state_flower' => 'Mayflower',
                'state_bird' => 'Black-capped Chickadee',
                'state_tree' => 'American Elm',
                'nickname' => 'The Bay State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'MI' => [
                'famous_food' => 'Cherries, pasties, Coney dogs',
                'famous_landmark' => 'Mackinac Island, Sleeping Bear Dunes',
                'famous_person' => 'Henry Ford, Madonna, Eminem',
                'state_motto' => 'Si quaeris peninsulam amoenam circumspice (If you seek a pleasant peninsula, look about you)',
                'state_flower' => 'Apple Blossom',
                'state_bird' => 'American Robin',
                'state_tree' => 'Eastern White Pine',
                'nickname' => 'The Great Lakes State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'MN' => [
                'famous_food' => 'Hotdish, wild rice, lutefisk',
                'famous_landmark' => 'Mall of America, Boundary Waters',
                'famous_person' => 'Prince, Bob Dylan, Judy Garland',
                'state_motto' => 'L\'Étoile du Nord (The star of the north)',
                'state_flower' => 'Pink and White Lady\'s Slipper',
                'state_bird' => 'Common Loon',
                'state_tree' => 'Red Pine',
                'nickname' => 'The North Star State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'MS' => [
                'famous_food' => 'Fried catfish, hush puppies, sweet tea',
                'famous_landmark' => 'Vicksburg National Military Park, Natchez Trace',
                'famous_person' => 'Elvis Presley, Oprah Winfrey, B.B. King',
                'state_motto' => 'Virtute et armis (By valor and arms)',
                'state_flower' => 'Magnolia',
                'state_bird' => 'Northern Mockingbird',
                'state_tree' => 'Magnolia',
                'nickname' => 'The Magnolia State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'MO' => [
                'famous_food' => 'Barbecue, toasted ravioli, gooey butter cake',
                'famous_landmark' => 'Gateway Arch, Mark Twain Boyhood Home',
                'famous_person' => 'Mark Twain, Harry S. Truman, Chuck Berry',
                'state_motto' => 'Salus populi suprema lex esto (The welfare of the people shall be the supreme law)',
                'state_flower' => 'Hawthorn',
                'state_bird' => 'Eastern Bluebird',
                'state_tree' => 'Flowering Dogwood',
                'nickname' => 'The Show-Me State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'MT' => [
                'famous_food' => 'Bison, huckleberries, trout',
                'famous_landmark' => 'Glacier National Park, Little Bighorn',
                'famous_person' => 'Gary Cooper, Evel Knievel, Jeannette Rankin',
                'state_motto' => 'Oro y plata (Gold and silver)',
                'state_flower' => 'Bitterroot',
                'state_bird' => 'Western Meadowlark',
                'state_tree' => 'Ponderosa Pine',
                'nickname' => 'The Treasure State',
                'time_zone' => 'Mountain Time',
                'driving_side' => 'Right'
            ],
            'NE' => [
                'famous_food' => 'Corn, beef, Runza',
                'famous_landmark' => 'Chimney Rock, Scotts Bluff National Monument',
                'famous_person' => 'Warren Buffett, Marlon Brando, Fred Astaire',
                'state_motto' => 'Equality before the law',
                'state_flower' => 'Goldenrod',
                'state_bird' => 'Western Meadowlark',
                'state_tree' => 'Cottonwood',
                'nickname' => 'The Cornhusker State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'NV' => [
                'famous_food' => 'Buffet, prime rib, Basque cuisine',
                'famous_landmark' => 'Las Vegas Strip, Hoover Dam, Area 51',
                'famous_person' => 'Andre Agassi, Pat Nixon, Charisma Carpenter',
                'state_motto' => 'All for our country',
                'state_flower' => 'Sagebrush',
                'state_bird' => 'Mountain Bluebird',
                'state_tree' => 'Single-leaf Pinyon',
                'nickname' => 'The Silver State',
                'time_zone' => 'Pacific Time',
                'driving_side' => 'Right'
            ],
            'NH' => [
                'famous_food' => 'Maple syrup, apple cider, lobster',
                'famous_landmark' => 'White Mountains, Mount Washington',
                'famous_person' => 'Alan Shepard, Robert Frost, Dan Brown',
                'state_motto' => 'Live Free or Die',
                'state_flower' => 'Purple Lilac',
                'state_bird' => 'Purple Finch',
                'state_tree' => 'White Birch',
                'nickname' => 'The Granite State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'NJ' => [
                'famous_food' => 'Pork roll, salt water taffy, diners',
                'famous_landmark' => 'Atlantic City, Liberty State Park',
                'famous_person' => 'Bruce Springsteen, Meryl Streep, Jon Bon Jovi',
                'state_motto' => 'Liberty and prosperity',
                'state_flower' => 'Violet',
                'state_bird' => 'Eastern Goldfinch',
                'state_tree' => 'Northern Red Oak',
                'nickname' => 'The Garden State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'NM' => [
                'famous_food' => 'Green chile, posole, biscochitos',
                'famous_landmark' => 'Carlsbad Caverns, White Sands, Roswell',
                'famous_person' => 'Georgia O\'Keeffe, Demi Lovato, Neil Patrick Harris',
                'state_motto' => 'Crescit eundo (It grows as it goes)',
                'state_flower' => 'Yucca',
                'state_bird' => 'Roadrunner',
                'state_tree' => 'Pinyon Pine',
                'nickname' => 'The Land of Enchantment',
                'time_zone' => 'Mountain Time',
                'driving_side' => 'Right'
            ],
            'NY' => [
                'famous_food' => 'Pizza, bagels, buffalo wings',
                'famous_landmark' => 'Statue of Liberty, Times Square, Niagara Falls',
                'famous_person' => 'Frank Sinatra, Lady Gaga, Donald Trump',
                'state_motto' => 'Excelsior (Ever upward)',
                'state_flower' => 'Rose',
                'state_bird' => 'Eastern Bluebird',
                'state_tree' => 'Sugar Maple',
                'nickname' => 'The Empire State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'NC' => [
                'famous_food' => 'Barbecue, sweet potatoes, hush puppies',
                'famous_landmark' => 'Great Smoky Mountains, Outer Banks',
                'famous_person' => 'Michael Jordan, Andy Griffith, Ava Gardner',
                'state_motto' => 'Esse quam videri (To be, rather than to seem)',
                'state_flower' => 'Dogwood',
                'state_bird' => 'Northern Cardinal',
                'state_tree' => 'Pine',
                'nickname' => 'The Tar Heel State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'ND' => [
                'famous_food' => 'Knoephla soup, lefse, bison',
                'famous_landmark' => 'Theodore Roosevelt National Park, Enchanted Highway',
                'famous_person' => 'Lawrence Welk, Angie Dickinson, Josh Duhamel',
                'state_motto' => 'Liberty and union, now and forever, one and inseparable',
                'state_flower' => 'Wild Prairie Rose',
                'state_bird' => 'Western Meadowlark',
                'state_tree' => 'American Elm',
                'nickname' => 'The Peace Garden State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'OH' => [
                'famous_food' => 'Buckeyes, Cincinnati chili, pierogies',
                'famous_landmark' => 'Rock and Roll Hall of Fame, Cedar Point',
                'famous_person' => 'Neil Armstrong, LeBron James, Steven Spielberg',
                'state_motto' => 'With God, all things are possible',
                'state_flower' => 'Scarlet Carnation',
                'state_bird' => 'Northern Cardinal',
                'state_tree' => 'Ohio Buckeye',
                'nickname' => 'The Buckeye State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'OK' => [
                'famous_food' => 'Fried okra, chicken fried steak, pecan pie',
                'famous_landmark' => 'Route 66, Oklahoma City National Memorial',
                'famous_person' => 'Will Rogers, Reba McEntire, Blake Shelton',
                'state_motto' => 'Labor omnia vincit (Labor conquers all things)',
                'state_flower' => 'Oklahoma Rose',
                'state_bird' => 'Scissor-tailed Flycatcher',
                'state_tree' => 'Redbud',
                'nickname' => 'The Sooner State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'OR' => [
                'famous_food' => 'Marionberries, hazelnuts, craft beer',
                'famous_landmark' => 'Crater Lake, Mount Hood, Columbia River Gorge',
                'famous_person' => 'Matt Groening, Tonya Harding, River Phoenix',
                'state_motto' => 'Alis volat propriis (She flies with her own wings)',
                'state_flower' => 'Oregon Grape',
                'state_bird' => 'Western Meadowlark',
                'state_tree' => 'Douglas Fir',
                'nickname' => 'The Beaver State',
                'time_zone' => 'Pacific Time',
                'driving_side' => 'Right'
            ],
            'PA' => [
                'famous_food' => 'Philly cheesesteak, soft pretzels, scrapple',
                'famous_landmark' => 'Independence Hall, Gettysburg, Hershey Park',
                'famous_person' => 'Benjamin Franklin, Will Smith, Taylor Swift',
                'state_motto' => 'Virtue, liberty, and independence',
                'state_flower' => 'Mountain Laurel',
                'state_bird' => 'Ruffed Grouse',
                'state_tree' => 'Eastern Hemlock',
                'nickname' => 'The Keystone State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'RI' => [
                'famous_food' => 'Clam cakes, coffee milk, stuffies',
                'famous_landmark' => 'Newport Mansions, Block Island',
                'famous_person' => 'H.P. Lovecraft, Viola Davis, Meredith Vieira',
                'state_motto' => 'Hope',
                'state_flower' => 'Violet',
                'state_bird' => 'Rhode Island Red',
                'state_tree' => 'Red Maple',
                'nickname' => 'The Ocean State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'SC' => [
                'famous_food' => 'Shrimp and grits, boiled peanuts, sweet tea',
                'famous_landmark' => 'Myrtle Beach, Charleston Historic District',
                'famous_person' => 'Dizzy Gillespie, Vanna White, Darius Rucker',
                'state_motto' => 'Dum spiro spero (While I breathe, I hope)',
                'state_flower' => 'Yellow Jessamine',
                'state_bird' => 'Carolina Wren',
                'state_tree' => 'Sabal Palmetto',
                'nickname' => 'The Palmetto State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'SD' => [
                'famous_food' => 'Chislic, kuchen, pheasant',
                'famous_landmark' => 'Mount Rushmore, Badlands, Crazy Horse Memorial',
                'famous_person' => 'Tom Brokaw, January Jones, Brock Lesnar',
                'state_motto' => 'Under God the people rule',
                'state_flower' => 'Pasque Flower',
                'state_bird' => 'Ring-necked Pheasant',
                'state_tree' => 'Black Hills Spruce',
                'nickname' => 'The Mount Rushmore State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'TN' => [
                'famous_food' => 'Hot chicken, barbecue, country ham',
                'famous_landmark' => 'Graceland, Great Smoky Mountains, Nashville',
                'famous_person' => 'Elvis Presley, Dolly Parton, Morgan Freeman',
                'state_motto' => 'Agriculture and Commerce',
                'state_flower' => 'Iris',
                'state_bird' => 'Northern Mockingbird',
                'state_tree' => 'Tulip Poplar',
                'nickname' => 'The Volunteer State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'TX' => [
                'famous_food' => 'BBQ, Tex-Mex, chicken fried steak',
                'famous_landmark' => 'Alamo, Big Bend, Space Center Houston',
                'famous_person' => 'Willie Nelson, Beyoncé, Matthew McConaughey',
                'state_motto' => 'Friendship',
                'state_flower' => 'Bluebonnet',
                'state_bird' => 'Northern Mockingbird',
                'state_tree' => 'Pecan',
                'nickname' => 'The Lone Star State',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'UT' => [
                'famous_food' => 'Fry sauce, funeral potatoes, Jell-O',
                'famous_landmark' => 'Zion National Park, Arches, Salt Lake Temple',
                'famous_person' => 'Donny Osmond, Roseanne Barr, Orson Scott Card',
                'state_motto' => 'Industry',
                'state_flower' => 'Sego Lily',
                'state_bird' => 'California Gull',
                'state_tree' => 'Quaking Aspen',
                'nickname' => 'The Beehive State',
                'time_zone' => 'Mountain Time',
                'driving_side' => 'Right'
            ],
            'VT' => [
                'famous_food' => 'Maple syrup, cheddar cheese, apple pie',
                'famous_landmark' => 'Green Mountains, Ben & Jerry\'s, covered bridges',
                'famous_person' => 'Calvin Coolidge, Bernie Sanders, Phish',
                'state_motto' => 'Freedom and Unity',
                'state_flower' => 'Red Clover',
                'state_bird' => 'Hermit Thrush',
                'state_tree' => 'Sugar Maple',
                'nickname' => 'The Green Mountain State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'VA' => [
                'famous_food' => 'Virginia ham, peanuts, apple butter',
                'famous_landmark' => 'Mount Vernon, Shenandoah National Park, Colonial Williamsburg',
                'famous_person' => 'George Washington, Thomas Jefferson, Sandra Bullock',
                'state_motto' => 'Sic semper tyrannis (Thus always to tyrants)',
                'state_flower' => 'American Dogwood',
                'state_bird' => 'Northern Cardinal',
                'state_tree' => 'Flowering Dogwood',
                'nickname' => 'The Old Dominion',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'WA' => [
                'famous_food' => 'Salmon, apples, coffee, craft beer',
                'famous_landmark' => 'Space Needle, Mount Rainier, Pike Place Market',
                'famous_person' => 'Bill Gates, Kurt Cobain, Jimi Hendrix',
                'state_motto' => 'Al-ki (By and by)',
                'state_flower' => 'Coast Rhododendron',
                'state_bird' => 'American Goldfinch',
                'state_tree' => 'Western Hemlock',
                'nickname' => 'The Evergreen State',
                'time_zone' => 'Pacific Time',
                'driving_side' => 'Right'
            ],
            'WV' => [
                'famous_food' => 'Pepperoni rolls, ramps, buckwheat cakes',
                'famous_landmark' => 'New River Gorge, Harpers Ferry',
                'famous_person' => 'Chuck Yeager, Don Knotts, Jennifer Garner',
                'state_motto' => 'Montani semper liberi (Mountaineers are always free)',
                'state_flower' => 'Rhododendron',
                'state_bird' => 'Northern Cardinal',
                'state_tree' => 'Sugar Maple',
                'nickname' => 'The Mountain State',
                'time_zone' => 'Eastern Time',
                'driving_side' => 'Right'
            ],
            'WI' => [
                'famous_food' => 'Cheese, bratwurst, fish fry',
                'famous_landmark' => 'Door County, Wisconsin Dells, Lambeau Field',
                'famous_person' => 'Frank Lloyd Wright, Laura Ingalls Wilder, Chris Farley',
                'state_motto' => 'Forward',
                'state_flower' => 'Wood Violet',
                'state_bird' => 'American Robin',
                'state_tree' => 'Sugar Maple',
                'nickname' => 'America\'s Dairyland',
                'time_zone' => 'Central Time',
                'driving_side' => 'Right'
            ],
            'WY' => [
                'famous_food' => 'Bison, trout, huckleberries',
                'famous_landmark' => 'Yellowstone National Park, Grand Teton, Devils Tower',
                'famous_person' => 'Jackson Pollock, Dick Cheney, Harrison Ford',
                'state_motto' => 'Equal Rights',
                'state_flower' => 'Indian Paintbrush',
                'state_bird' => 'Western Meadowlark',
                'state_tree' => 'Plains Cottonwood',
                'nickname' => 'The Equality State',
                'time_zone' => 'Mountain Time',
                'driving_side' => 'Right'
            ]
        ];

        return $metrics[$stateCode] ?? [];
    }

    private function addMetric(UsState $state, string $metricKey, string $metricValue, \App\Entity\Source $source): void
    {
        // Check if metric already exists
        $existingMetric = $this->em->getRepository(UsStateMetric::class)->findOneBy([
            'state' => $state,
            'metricKey' => $metricKey
        ]);

        if ($existingMetric) {
            $existingMetric->setMetricValue($metricValue);
            $existingMetric->setUpdatedAt(new \DateTimeImmutable());
        } else {
            $metric = new UsStateMetric();
            $metric->setState($state)
                   ->setMetricKey($metricKey)
                   ->setMetricValue($metricValue)
                   ->setSource($source);

            $this->em->persist($metric);
        }
    }
}
