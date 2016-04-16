-- Problem 1
myLast :: [a] -> a
myLast [] = error "Empty list has no last element!"
myLast [x] = x
myLast (x:xs) = myLast xs

-- Problem 2
myButLast :: [a] -> a
myButLast [] = error "Empty list has no second to last element!"
myButLast [_] = error "Single element list has no second to last element!"
myButLast (x:_:[]) = x
myButLast (_:xs) = myButLast xs

-- Problem 3
elementAt :: Integral b => [a] -> b -> a
elementAt [] _ = error "Index error"
elementAt (x:_) 1 = x
elementAt (_:xs) n
        | n < 1 = error "Index out of bounds"
        | otherwise = elementAt xs (n-1)

-- Problem 4
myLength :: [a] -> Int
myLength [] = 0
myLength (x:xs) = 1 + myLength xs

-- Problem 5
myReverse :: [a] -> [a]
myReverse [] = []
myReverse (x:xs) = myReverse xs ++ [x]

-- Problem 6 
isPalindrome :: Eq a => [a] -> Bool
isPalindrome [] = True
isPalindrome [_] = True
isPalindrome (x:xs) = if last xs == x then isPalindrome (init xs) else False

-- Problem 7
