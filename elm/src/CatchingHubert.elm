module CatchingHubert exposing (main)


import Playground exposing (..)


import Set exposing (Set)

-- MAIN

main =
  game view update init



-- MODEL

type alias Memory =
  { x : Number
  , y : Number
  , v : Number 
  , targetX : Number
  , targetY : Number
  , behavior : Behavior
  , inventory : Maybe ItemOption
  , consumables : List Consumable
  }


type Consumable
  = WaterPool Number Number
  | MeatPile Number Number
  | TrapCage Number Number


type Behavior
  = Wandering

type ItemOption
  = TrapItem
  | MeatItem
  | WaterItem


init : Memory
init =
  { x = 0
  , y = 0
  , v = 3
  , targetX = 0
  , targetY = 0
  , behavior = Wandering
  , inventory = Nothing
  , consumables = []
  }


-- UPDATE


update : Computer -> Memory -> Memory
update computer memory =
  let
    dx = (memory.targetX - memory.x)
    dy = (memory.targetY - memory.y)
    d = sqrt (dx*dx + dy*dy)
    dd = if 0 == d then 1 else d
    v = memory.v
    epsilon = 5
  in
    { memory
    | x = if dd > epsilon then memory.x + (v * (toFloat <| floor dx) / dd) else memory.targetX
    , y = if dd > epsilon then memory.y + (v * (toFloat <| floor dy) / dd) else memory.targetY
    , targetX = if computer.mouse.click && Set.member "Shift" computer.keyboard.keys then computer.mouse.x else memory.targetX
    , targetY = if computer.mouse.click && Set.member "Shift" computer.keyboard.keys then computer.mouse.y else memory.targetY
    , inventory = updateInventory computer memory
    , consumables = updateConsumables computer memory
    }



updateConsumables : Computer -> Memory -> List Consumable
updateConsumables computer memory =
  if computer.mouse.click then
    case updateInventory computer memory of
      Nothing ->
        case memory.inventory of
          Nothing ->
            memory.consumables

          Just TrapItem ->
            TrapCage computer.mouse.x computer.mouse.y :: memory.consumables

          Just MeatItem ->
            MeatPile computer.mouse.x computer.mouse.y :: memory.consumables

          Just WaterItem ->
            WaterPool computer.mouse.x computer.mouse.y :: memory.consumables

      Just TrapItem ->
        memory.consumables

      Just MeatItem ->
        memory.consumables

      Just WaterItem ->
        memory.consumables
  else
    memory.consumables


updateInventory : Computer -> Memory -> Maybe ItemOption
updateInventory computer memory =
  let
    collisions = detectCollision computer memory
  in
    if computer.mouse.click then
      if collisions.emptyOption then
        Just TrapItem
      else
        if collisions.meatOption then
          Just MeatItem
        else
          if collisions.waterOption then
            Just WaterItem
          else
            Nothing
    else
      memory.inventory


type alias Collisions =
  { hubert : Bool
  , emptyOption : Bool
  , meatOption : Bool
  , waterOption : Bool
  }

detectCollision : Computer -> Memory -> Collisions
detectCollision computer memory =
  let
    x = computer.mouse.x
    y = computer.mouse.y
  in
    { hubert = computer.mouse.x > (memory.x - 10) && computer.mouse.x < (memory.x + 10)
    , emptyOption = (screenWidth/2) < x && x < (screenWidth)/2 + optionWidth && screenHeight/2 - optionHeight < y && y < screenHeight/2 
    , meatOption = (screenWidth/2) < x && x < (screenWidth)/2 + optionWidth && screenHeight/2 - (2*optionHeight) < y && y < screenHeight/2 - optionHeight
    , waterOption = (screenWidth/2) < x && x < (screenWidth)/2 + optionWidth && screenHeight/2 - (3*optionHeight) < y && y < screenHeight/2 - (2*optionHeight)
    }


-- VIEW

screenWidth : Number
screenWidth = 500

screenHeight : Number
screenHeight = 300

optionHeight : Number
optionHeight = 40

optionWidth : Number
optionWidth = optionHeight


view : Computer -> Memory -> List Shape
view computer memory =
  [ renderBorder
  , renderItemShop |> move (screenWidth/2 + optionWidth/2) (screenHeight/2 - optionHeight/2)
  , renderTarget memory
  , renderHubert computer.time |> move memory.x memory.y
  , renderInventory computer memory |> move computer.mouse.x computer.mouse.y
  , renderConsumables memory.consumables
  , move 0 (-screenHeight/2 - 20) <| words black ( List.foldr (++) "" <| List.map (\k -> k ++ " " ) <| Set.toList computer.keyboard.keys)
  ]

  -- ++ [ renderDebugOverlay <| detectCollision computer memory ]


debugInventory : Maybe ItemOption -> String
debugInventory option =
  case option of
    Nothing ->
      "_-_-_-_"

    Just e ->
      case e of
        TrapItem ->
          "Trap Inventory"

        MeatItem ->
          "Meat Inventory"

        WaterItem ->
          "Water Inventory"



consumableToOption : Consumable -> ItemOption
consumableToOption consumable =
  case consumable of
    TrapCage _ _ ->
      TrapItem

    MeatPile _ _ ->
      MeatItem

    WaterPool _ _ ->
      WaterItem


renderConsumable : Consumable ->  Shape
renderConsumable consumable =
  circle (consumable |> consumableToOption |> optionToColor ) 10


renderConsumables : List Consumable -> Shape
renderConsumables consumables =
  group
    (List.map (\c -> case c of
      TrapCage x y ->
        renderConsumable c |> move x y

      MeatPile x y ->
        renderConsumable c |> move x y

      WaterPool x y ->
        renderConsumable c |> move x y
      ) consumables
    )


renderTarget : Memory -> Shape
renderTarget memory =
  group
    [ rectangle red 10 5
    , rectangle red 5 10
    ] |> move memory.targetX memory.targetY


renderBorder : Shape
renderBorder =
  group
    [ rectangle black screenWidth screenHeight
    , rectangle white (screenWidth - 10) (screenHeight - 10)    
    ]


renderHubert : Time -> Shape
renderHubert time =
  group
    [ renderEye
    , oval black 40 20 |> move 0 (0 - 20 - 72) |> fade 0.5
    , renderTail time |> move 0 -40
    ] |> move 0 92


renderEye : Shape
renderEye =
  group
    [ circle black 40
    , circle white 36
    , circle black 10 |> move (40/2) 0
    ] |> move 0 20


customZigZag : Number -> Number -> Number -> Number -> Number
customZigZag lo hi period millis =
  let
    p = period * 1000
    frac = toFloat (modBy (round p) (round millis) ) / p
  in
    lo + (hi - lo) * abs (2 * frac - 1)


renderTail : Time -> Shape
renderTail time =
  let 
    period = 2
    millis = zigzag 1 1000 1 time
    hi = 10
    lo = -10
  in
    List.range 0 11 |> List.map toFloat |> List.map (\i -> circle black 5 |> move (customZigZag lo hi period (millis + (i*0.5*1000) ) ) (-i*6)) |> group |> move 0 20


renderInventory : Computer -> Memory -> Shape
renderInventory computer memory =
  group
    (case memory.inventory of
      Nothing ->
        []

      Just TrapItem ->
        [ circle (optionToColor TrapItem) 10 ]

      Just MeatItem ->
        [ circle (optionToColor MeatItem) 10 ]

      Just WaterItem ->
        [ circle (optionToColor WaterItem) 10 ])


renderItemShop : Shape
renderItemShop =
  group
    [ renderItemOption TrapItem
    , renderItemOption MeatItem |> move 0 -optionHeight
    , renderItemOption WaterItem |> move 0 (-2*optionHeight)
    ]



renderItemOption : ItemOption ->  Shape
renderItemOption option =
  group 
    [ rectangle black optionWidth optionHeight
    , rectangle white (optionWidth - 2) (optionHeight - 2)
    , circle (optionToColor option) 10
    ]


optionToColor : ItemOption -> Color
optionToColor option =
  case option of
    TrapItem ->
      black

    MeatItem ->
      red

    WaterItem ->
      blue



renderDebugOverlay : Collisions ->  Shape
renderDebugOverlay collisions =
  group
    (List.foldr (++) [] [
      (if collisions.emptyOption then [ rectangle red optionWidth optionHeight ] else []),
      (if collisions.meatOption then [ rectangle red optionWidth optionHeight |> move 0 -optionHeight ] else []),
      (if collisions.waterOption then [ rectangle red optionWidth optionHeight |> move 0 (-2*optionHeight) ] else [])
    ]) |> move (screenWidth/2 + optionWidth/2) (screenHeight/2 - optionHeight/2)






