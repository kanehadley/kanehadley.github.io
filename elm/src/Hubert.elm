module Hubert exposing (main)

import Playground exposing (..)
import Random exposing (initialSeed, step)
import Set



-- MAIN

main =
  game view update init


-- MODEL

type Consumable
  = FrostingPool Number Number
  | SugarPile Number Number

type State
  = Idle
  | Eating


type Orientation
  = FaceLeft
  | FaceRight


type alias Memory =
  { x : Number
  , y : Number
  , velocity : Number
  , state : State
  , orientation : Orientation
  , spawnSeed : Random.Seed
  , consumables : List Consumable
  , nextSpawn : Int
  , stateTimer : Int
  , consumptionTimer : Int
  }


randomWidth : Random.Generator Number
randomWidth =
  Random.float (-viewWidth/2) (viewWidth/2)


randomHeight : Random.Generator Number
randomHeight =
  Random.float (-viewHeight/2) (viewHeight/2)


randomConsumable : Random.Generator Consumable
randomConsumable =
  Random.map2 SugarPile randomWidth randomHeight


init : Memory
init =
  { x = 0
  , y = 0
  , velocity = 5
  , state = Idle
  , orientation = FaceRight
  , spawnSeed = initialSeed 1
  , consumables = []
  , nextSpawn = 10
  , stateTimer = 0
  , consumptionTimer = 0
  }

-- UPDATE


update : Computer -> Memory -> Memory
update computer memory =
  spawnConsumable computer <| consume computer <| determineState computer <| moveHubert computer <| memory




consume : Computer -> Memory -> Memory
consume computer memory =
  case memory.state of
    Eating ->
      case memory.consumptionTimer < 0 of
        True ->
          --let
          --  xConsumptionOffset = 
          { memory | consumables = List.filter (\c ->
            case c of
              SugarPile x y ->
                  case memory.orientation of
                    FaceRight ->
                      x < memory.x + 20 || x > memory.x + 60 || y > memory.y + 20 || y < memory.y - 20
                      --(x < memory.x + 20 || x > memory.x + 60) --&& (y > memory.y + 20 || y < memory.y - 20)
                    FaceLeft ->
                      x < memory.x - 60 || x > memory.x - 20 || y > memory.y + 20 || y < memory.y - 20

              FrostingPool x y ->
                True
            ) memory.consumables }
        False ->
          { memory | consumptionTimer = memory.consumptionTimer - 1 }

    Idle ->
      memory



eatingDuration : Int
eatingDuration =
  50


determineState : Computer -> Memory -> Memory
determineState computer memory =
  case memory.state of
    Idle ->
      case Set.member " " computer.keyboard.keys of
        True ->
          { memory
          | state = Eating
          , stateTimer = eatingDuration
          , consumptionTimer = ceiling (toFloat eatingDuration / 2)
          }
        False ->
          memory
    Eating ->
      case memory.stateTimer < 0 of
        True ->
          { memory | state = Idle, stateTimer = 0 }
        False ->
          { memory | stateTimer = memory.stateTimer - 1 }


spawnConsumable : Computer -> Memory -> Memory
spawnConsumable computer memory =
  case memory.nextSpawn < 0 of
    True ->
      let
        (consumable, seed) = step randomConsumable memory.spawnSeed
      in
        { memory
        | spawnSeed = seed
        , consumables = consumable :: memory.consumables
        , nextSpawn = 1
        }
    False ->
      { memory | nextSpawn = memory.nextSpawn - 1 }


determineOrientation : Orientation -> Number -> Orientation
determineOrientation orientation dx =
  case dx == 0 of
    True ->
      orientation
    False ->
      case dx > 0 of
        True ->
          FaceRight
        False ->
          FaceLeft



moveHubert : Computer -> Memory -> Memory
moveHubert computer memory =
  let
    (dx, dy) = toXY computer.keyboard
  in
    { memory
    | x = memory.x + memory.velocity * dx
    , y = memory.y + memory.velocity * dy
    , orientation = determineOrientation memory.orientation dx
    }

-- VIEW


viewWidth : Number
viewWidth =
  500


viewHeight : Number
viewHeight =
  500



view : Computer -> Memory -> List Shape
view computer memory =
  let
    xConsumptionOffset = (
      case memory.orientation of
        FaceRight ->
          20
        FaceLeft ->
          -60
        )
  in
  [ renderBorder
  , renderConsumables memory.consumables
  , words black "Control Hubert with the arrow keys. Eat with the spacebar with the green square as Hubert's focus. Consume all the red sugar piles!" |> move 0 (viewHeight/2 + 20)
  , renderHubert memory computer.time |> move memory.x memory.y
  --, words black ("_" ++ (Set.foldr (++) "" computer.keyboard.keys) ++ "_") |> move 0 (viewHeight/2 + 10)
  --, words black (stateToString memory.state) |> move 0 (viewHeight/2 + 10)
  --, words black (String.fromFloat <| ((92*(sin ((eatingAngle memory.orientation memory.stateTimer)*pi/180 ) )))  ) |> move 0 (viewHeight/2 + 10)
  , rectangle green 40 40 |> fade 0.5 |> move (memory.x + 20 + xConsumptionOffset) (memory.y - 20 + 20)
  --, circle blue 10 |> move memory.x memory.y
  ]


stateToString : State -> String
stateToString state =
  case state of
    Idle ->
      "Idle"
    Eating ->
      "Eating"


renderConsumables : List Consumable -> Shape
renderConsumables consumables =
  group
    <| List.map (\c ->
        case c of
          SugarPile x y ->
            circle red 10 |> move x y

          FrostingPool x y->
            circle red 10 |> move x y ) consumables


renderBorder : Shape
renderBorder =
  group
    [ rectangle black viewWidth viewHeight
    , rectangle white (viewWidth - 10) (viewHeight - 10)
    ]


renderHubert : Memory -> Time -> Shape
renderHubert memory time =
  group
    [ renderEye memory.orientation
    , oval black 40 20 |> move 0 (0 - 20 - 72) |> fade 0.5
    , renderTail time |> move 0 -40
    ] |> renderBehavior memory time |> move 0 92


renderBehavior : Memory -> Time -> Shape -> Shape
renderBehavior memory time shape =
  case memory.state of
    Idle ->
      shape
    Eating ->
      let
        angle = eatingAngle memory.orientation memory.stateTimer
        --angle = 60
      in
        --rotate angle shape |> move (92*(cos (angle*pi/180) )) (-92*(sin (angle*pi / 180)))
        shape 
          --|> move (92 - (92*(cos (angle*pi/180)) )) (92*(sin (angle*pi/180)))
          |> rotate angle --|> move (-92 * (cos (angle*pi/180))) (-92 * (sin (angle*pi/180)))
          |> move -(92*(sin (angle*pi/180))) (-(92 - (92*(cos (angle*pi/180)))))  -- -(92 - (92*(cos (angle*pi/180)) )) 0



eatingAngle : Orientation -> Int -> Float
eatingAngle orientation time =
  let
    maxAngle = (case orientation of
      FaceRight ->
        -45
      FaceLeft ->
        45)
    halfPeriod = toFloat eatingDuration / 2
    timer = toFloat (eatingDuration - time)
  in
    case timer < halfPeriod of
      True ->
        timer * (maxAngle / halfPeriod)

      False ->
        (toFloat eatingDuration - timer) * (maxAngle / halfPeriod)
--((toFloat memory.stateTimer) * -90 / (toFloat eatingDuration))



renderEye : Orientation -> Shape
renderEye orientation =
  let
    eyeShift = case orientation of
      FaceRight ->
        40/2
      FaceLeft ->
        -40/2
  in
    group
      [ circle black 40
      , circle white 36
      , circle black 10 |> move eyeShift 0
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


