import Data.List (nub, sort)
-- import Data.List hiding (nub)
import qualified Data.Map as M

numUniques :: (Eq a) => [a] -> Int
numUniques = length . nub
