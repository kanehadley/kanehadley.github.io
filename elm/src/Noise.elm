--module Noise exposing (main)
module Noise exposing (..)

-- import Noise exposing (perlinGradients, perlinPermutations, lerp, permutationHash, dotGradient, fPermutationPerlin, fPerlin, generate2DNoise)

import  Browser

import Html exposing (Html, div, text, button, h1, input)
import Html.Attributes exposing (style, placeholder, value, type_)
import Html.Events exposing (onClick)

import Random exposing (initialSeed, step)


import Svg exposing (Svg, svg, g, circle, rect, line)
import Svg.Attributes exposing (width, height, stroke, strokeWidth, fill, x, y, cx, cy, r, x1, y1, x2, y2)

import Array exposing (Array)

import Tuple

import Time



import WebGL exposing (Mesh, Shader)
import Math.Matrix4 as Mat4 exposing (Mat4)
import Math.Vector3 as Vec3 exposing (vec3, Vec3)
import Math.Vector2 as Vec2 exposing (vec2, Vec2, dot)


import Debug



-- MAIN


main : Program () Model Msg
main =
  Browser.element
    { init = init
    , update = update
    , view = view
    , subscriptions = subscriptions
    }


-- MODEL


startingOffset : Float
startingOffset =
  --0.2
  0.2


type alias Model =
  { num1DNoisePoints : Int
  , data1DNoise : Array Float
  , noise1DX : (Float -> Float)
  , noise1DY : (Float -> Float)
  , width1D : Float
  , height1D : Float
  , xToPixel1D : (Float -> Float)
  , yToPixel1D : (Float -> Float)
  , offset : Float
  , sampling : Int
  , animate : Bool

  , width2D : Float
  , height2D : Float
  , data2DNoiseX : Array Float
  , data2DNoiseY : Array Float
  , permutationTable2D : Array Int
  , num2DNoisePoints : Int
  , noise2D : (Float -> Float -> Float)
  , smoothing2D : (Float -> Float)
  , xToPixel2D : (Float -> Float)
  , yToPixel2D : (Float -> Float)
  , offset2D : Float
  , sampling2D : Int
  , animate2D : Bool
  , scaling2D : Float
  , frequency2D : Float
  , amplitude2D : Float

  , eye : Vec3
  , center : Vec3
  , upAxis : Vec3

  --, debug : PerlinDebug
  }




init : () -> (Model, Cmd Msg)
init _ =
  let
    width = 400
    height = 400
    initialPointCount = 13
    initialSampling = 3
    initialDomainCount = 100
    domain = generate1DNoiseDomain initialDomainCount (initialSeed 1) []

    domain2DX = generate1DNoiseDomain initialDomainCount (initialSeed 1) []
    domain2DY = generate1DNoiseDomain initialDomainCount (initialSeed 1000) []

    permute2D = generatePermutationTable initialPointCount
  in
    (
      { num1DNoisePoints = initialPointCount
      , data1DNoise = domain
      , noise1DX = identity
      , noise1DY = f1DNoise domain identity
      , xToPixel1D = generate1DNoisePixel (width - 10) (toFloat initialPointCount)
      , yToPixel1D = generate1DNoisePixel (height - 10) (toFloat initialPointCount) --(\y -> height - (y * height ))
      , width1D = width
      , height1D = height
      , offset = startingOffset
      , sampling = 10
      , animate = False

      , width2D = width
      , height2D = height
      , data2DNoiseX = domain2DX
      , data2DNoiseY = domain2DY
      , permutationTable2D = permute2D
      , num2DNoisePoints = 10
      , noise2D = f2DNoise domain2DX permute2D identity
      , smoothing2D = identity
      , xToPixel2D = (\x -> x + 5)<< (\x -> width*x) --(\x -> x + 5) << generate1DNoisePixel (width - 10) initialPointCount
      , yToPixel2D = (\y -> y + 5)<< (\y -> height*y) --(\y -> y + 5) << generate1DNoisePixel (height - 10) initialPointCount
      , offset2D = 0 --244.9 --startingOffset
      , sampling2D = initialSampling
      , animate2D = True
      , scaling2D = 1
      , frequency2D = 0.5
      , amplitude2D = 1

      , eye = vec3 2 -2 2
      , center = vec3 0 0 0
      , upAxis = vec3 0 1 0

      --, debug = defaultPerlinDebug      
      }
    , Cmd.none
    )



initialize1DNoise : Int -> Random.Seed -> List Float -> List Float
initialize1DNoise n currentSeed numbersSoFar =
  if 0 == n then
    numbersSoFar
  else
    let
      (newP, newS) = step (Random.float 0 1) currentSeed
    in
      initialize1DNoise (n-1) newS (numbersSoFar ++ [newP])



generate1DNoiseDomain : Int -> Random.Seed -> List Float -> Array Float
generate1DNoiseDomain desiredPoints currentSeed domain =
  if 0 == desiredPoints then
    Array.fromList domain
  else
    let
      (newP, newS) = step (Random.float 0 1) currentSeed
    in
      generate1DNoiseDomain (desiredPoints-1) newS (domain ++ [newP])



lerp : Float -> Float -> Float -> Float
lerp minX maxX t =
  ((1-t) * minX) + (t * maxX)


cosineSmoothing : Float -> Float
cosineSmoothing t =
  (1 - cos(t * pi)) * 0.5
  --t * t * t * (t * (t * 6 - 15) + 10)

  


f1DNoise : Array Float -> (Float -> Float) -> (Float -> Float)
f1DNoise domain smoothing =
  (\x ->
    let
      minX = modBy (Array.length domain) <| floor x
      maxX = modBy (Array.length domain) (minX + 1)
      t = x - (toFloat <| floor x)

    in
      lerp (Maybe.withDefault 0 <| Array.get minX domain) (Maybe.withDefault 0 <| Array.get maxX domain) (smoothing t)
  )


f2DNoise : Array Float -> Array Int -> (Float -> Float) -> (Float -> Float -> Float)
f2DNoise domain permutations smoothing =
  (\x y ->
    let
      permute = (\i -> Maybe.withDefault 0 <| Array.get i permutations)
      minX = modBy (Array.length domain) <| floor x
      maxX = modBy (Array.length domain) (minX + 1)
      minY = modBy (Array.length domain) <| floor y
      maxY = modBy (Array.length domain) (minY + 1)
      tX = smoothing <| x - (toFloat <| floor x)
      tY = smoothing <| y - (toFloat <| floor y)
      c00 = Maybe.withDefault 0 <| Array.get (permute ((permute minX) + minY)) domain
      c10 = Maybe.withDefault 0 <| Array.get (permute ((permute maxX) + minY)) domain
      c01 = Maybe.withDefault 0 <| Array.get (permute ((permute minX) + maxY)) domain
      c11 = Maybe.withDefault 0 <| Array.get (permute ((permute maxX) + maxY)) domain
      
      nx0 = lerp c00 c10 tX
      nx1 = lerp c01 c11 tX
    in
      lerp nx0 nx1 tY
  )


perlinPermutations : Array Int
perlinPermutations =
  let
    permutationList = [ 151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 
                      103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 
                      26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 
                      87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 
                      77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 
                      46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 
                      187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 
                      198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 
                      255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 
                      170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 
                      172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 
                      104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 
                      241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 
                      157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 
                      93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180 ]
  in
    Array.fromList <| permutationList ++ permutationList

perlinGradients : Array Vec2
perlinGradients =
  Array.fromList <| List.map (\i ->
      let
        (vX, sX) = step (Random.float -1 1) (initialSeed i)
        (vY, sY) = step (Random.float -1 1) sX
        length = sqrt (vX*vX + vY*vY)
      in
        vec2 (vX/length) (vY/length)
    ) <| List.range 0 255



permutationHash : Array Vec2 -> Array Int -> Int -> Int -> Int
permutationHash gradients permutations x y =
  let
    gradientLength = Array.length gradients
    index = Maybe.withDefault 0 <| Array.get (modBy gradientLength ((Maybe.withDefault 0 <| Array.get (modBy gradientLength x) permutations) + y)) permutations
  in
    Array.get index permutations  |> Maybe.withDefault 0


dotGradient : Array Vec2 -> Array Int -> Int -> Int -> Float -> Float -> Float
dotGradient gradients permutations x y dx dy =
  let
    c = Maybe.withDefault (vec2 0 0) <| Array.get (permutationHash gradients permutations x y) gradients
    dv = vec2 dx dy
  in
    dot dv c



fPermutationPerlin : (Float -> Float) -> Array Vec2 -> Array Int -> (Float -> Float -> Float)
fPermutationPerlin smoothing gradients permutations =
  let
    gradientLength = Array.length gradients
  in
    (\rawX rawY ->
      let
        --tx = smoothing <| rawX - (toFloat <| floor rawX)
        --ty = smoothing <| rawY - (toFloat <| floor rawY)
        tx = rawX - (toFloat <| floor rawX)
        ty = rawY - (toFloat <| floor rawY)

        x = tx + (toFloat <| modBy gradientLength <| floor rawX)
        y = ty + (toFloat <| modBy gradientLength <| floor rawY)

        minX = toFloat <| floor x
        maxX = toFloat <| floor (minX + 1)
        minY = toFloat <| floor y
        maxY = toFloat <| floor (minY + 1)

        c00 = dotGradient gradients permutations (floor x) (floor y) (x - minX) (y - minY)
        c10 = dotGradient gradients permutations ((floor x) + 1) (floor y) (x - maxX) (y - minY)
        c01 = dotGradient gradients permutations (floor x) ((floor y) + 1) (x - minX) (y - maxY)
        c11 = dotGradient gradients permutations ((floor x) + 1) ((floor y) + 1) (x - maxX) (y - maxY)

        

        n0 = lerp c00 c10 (smoothing tx)
        n1 = lerp c01 c11 (smoothing tx)
      in
        lerp n0 n1 (smoothing ty)
    )



fPerlin : Float -> Float -> Float
fPerlin =
  fPermutationPerlin identity perlinGradients perlinPermutations
  --fPermutationPerlin cosineSmoothing perlinGradients perlinPermutations


fClassicalPerlin : Float -> Float -> Float
fClassicalPerlin x y =
  let
    calculateGradient = (\px py ->
        let
          g = 2920 * sin(px * 21942 + py * 171324 + 8912) * cos(px * 23157 + py * 217832 + 9758)
        in
          vec2 (cos g) (sin g)
      )
    randomGradient = (\px py ->
      let
        dx = x - px
        dy = y - py
        v = calculateGradient px py
        dv = vec2 dx dy
      in
        dot dv v
      )
    modFactor = 256
    minX = toFloat <| modBy modFactor <| floor x
    maxX = toFloat <| modBy modFactor <| floor (minX + 1)
    minY = toFloat <| modBy modFactor <| floor y
    maxY = toFloat <| modBy modFactor <| floor (minY + 1)
    c00 = randomGradient minX minY
    c10 = randomGradient maxX minY
    c01 = randomGradient minX maxY
    c11 = randomGradient maxX maxY

    tx = x - minX
    ty = y - minY
    n0 = lerp c00 c10 tx
    n1 = lerp c01 c11 tx

  in
    ((lerp n0 n1 ty) + 1) / 2



swap : Array Int -> Int -> Int -> Array Int
swap array i j =
  case i < j of
    True ->
      Array.fromList <| (Array.toList <| Array.slice 0 i array) ++ [(Maybe.withDefault j <| Array.get j array)] ++ (Array.toList <| Array.slice (i+1) j array) ++ [(Maybe.withDefault i <| Array.get i array)] ++ (Array.toList <| Array.slice (j+1) (Array.length array) array)
    False ->
      Array.fromList <| (Array.toList <| Array.slice 0 j array) ++ [(Maybe.withDefault i <| Array.get i array)] ++ (Array.toList <| Array.slice (j+1) i array) ++ [(Maybe.withDefault j <| Array.get j array)] ++ (Array.toList <| Array.slice (i+1) (Array.length array) array)



generatePermutationTable : Int -> Array Int
generatePermutationTable size =
  let
    original = randomizePermutationTable (Array.fromList (List.range 0 size)) (initialSeed 5) size
  in
    Array.fromList <| (Array.toList original) ++ (Array.toList original)


randomizePermutationTable : Array Int -> Random.Seed -> Int -> Array Int
randomizePermutationTable array currentSeed n =
  case 0 == n of
    True ->
      array
    False ->
      let
        (index, newS) = step (Random.int 0 ((Array.length array)-1)) currentSeed
      in
        randomizePermutationTable (swap array (n-1) index) newS (n-1)


-- UPDATE

type Msg
  = IncreasePoints
  | DecreasePoints
  | IncreaseOffset
  | DecreaseOffset
  | IncreaseSampling
  | DecreaseSampling
  | ToggleAnimate
  | NoSmoothing
  | CosineSmoothing

  | Increase2DPoints
  | Decrease2DPoints
  | Increase2DOffset
  | Decrease2DOffset
  | Increase2DSampling
  | Decrease2DSampling
  | Increase2DScaling
  | Decrease2DScaling
  | Toggle2DAnimate
  | No2DSmoothing
  | Cosine2DSmoothing

  | EyeX Float
  | EyeY Float
  | EyeZ Float

  | NewOffset Float
  | NewFrequency Float
  | NewAmplitude Float

  | Tick Time.Posix

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    IncreasePoints ->
      let
        newNoisePoints = model.num1DNoisePoints + 1
      in
        ({ model
          | num1DNoisePoints = newNoisePoints
          , xToPixel1D = generate1DNoisePixel model.width1D (toFloat newNoisePoints)
          }, Cmd.none)
    DecreasePoints ->
      let
        newNoisePoints = model.num1DNoisePoints - 1
      in
        ({ model
          | num1DNoisePoints = newNoisePoints
          , xToPixel1D = generate1DNoisePixel model.width1D (toFloat newNoisePoints)
          }, Cmd.none)
    IncreaseOffset ->
      ({ model | offset = model.offset + 0.2 }, Cmd.none)
    DecreaseOffset ->
      ({ model | offset = model.offset - 0.2 }, Cmd.none)
    IncreaseSampling ->
      ({ model | sampling = model.sampling + 1 }, Cmd.none)
    DecreaseSampling ->
      ({ model | sampling = model.sampling - 1 }, Cmd.none)
    ToggleAnimate ->
      ({ model | animate = not model.animate }, Cmd.none)
    NoSmoothing ->
      ({ model | noise1DY = f1DNoise model.data1DNoise identity }, Cmd.none)
    CosineSmoothing ->
      ({ model | noise1DY = f1DNoise model.data1DNoise cosineSmoothing }, Cmd.none)

    Increase2DPoints ->
      let
        newNoisePoints = model.num2DNoisePoints + 1
      in
        ({ model
          | num2DNoisePoints = newNoisePoints
          , xToPixel2D = (\x -> x + 5)<< (\x -> (model.width2D-10)*x) --(\x -> x + 5) << generate1DNoisePixel (model.width2D - 10) (toFloat newNoisePoints)
          , yToPixel2D = (\y -> y + 5)<< (\y -> (model.height2D-10)*y) --(\y -> y + 5) << generate1DNoisePixel (model.height2D - 10) (toFloat newNoisePoints)
          }, Cmd.none)
    Decrease2DPoints ->
      let
        newNoisePoints = model.num2DNoisePoints - 1
      in
        ({ model
          | num2DNoisePoints = newNoisePoints
          , xToPixel2D = (\x -> x + 5)<< (\x -> (model.width2D-10)*x) --(\x -> x + 5) << generate1DNoisePixel (model.width2D - 10) (toFloat newNoisePoints)
          , yToPixel2D = (\y -> y + 5)<< (\y -> (model.height2D-10)*y) --(\y -> y + 5) << generate1DNoisePixel (model.height2D - 10) (toFloat newNoisePoints)
          }, Cmd.none)
    Increase2DOffset ->
      ({ model | offset2D = model.offset2D + 0.2 }, Cmd.none)
    Decrease2DOffset ->
      ({ model | offset2D = model.offset2D - 0.2 }, Cmd.none)
    Increase2DSampling ->
      let
        newSampling2D = model.sampling2D + 1
      in
        ({ model
          | sampling2D = newSampling2D
          , xToPixel2D = (\x -> x + 5)<< (\x -> (model.width2D-10)*x) --(\x -> x + 5) << generate1DNoisePixel (model.width2D - 10) (toFloat model.num2DNoisePoints)
          , yToPixel2D = (\y -> y + 5)<< (\y -> (model.height2D-10)*y)  --(\y -> y + 5) << generate1DNoisePixel (model.height2D - 10) (toFloat model.num2DNoisePoints)
          }, Cmd.none)
    Decrease2DSampling ->
      let
        newSampling2D = model.sampling2D - 1
      in
        ({ model 
          | sampling2D = model.sampling2D - 1
          , xToPixel2D = (\x -> x + 5)<< (\x -> (model.width2D-10)*x) --(\x -> x + 5) << generate1DNoisePixel (model.width2D - 10) (toFloat model.num2DNoisePoints)
          , yToPixel2D = (\y -> y + 5)<< (\y -> (model.height2D-10)*y) --(\y -> y + 5) << generate1DNoisePixel (model.height2D - 10) (toFloat model.num2DNoisePoints)
          }, Cmd.none)
    Increase2DScaling ->
      ({ model | scaling2D = model.scaling2D + 0.05 }, Cmd.none)
    Decrease2DScaling ->
      ({ model | scaling2D = model.scaling2D - 0.05 }, Cmd.none)
    Toggle2DAnimate ->
      ({ model | animate2D = not model.animate2D }, Cmd.none)
    No2DSmoothing ->
      ({ model
       | noise2D = f2DNoise model.data2DNoiseX model.permutationTable2D identity
       , smoothing2D = identity
       }, Cmd.none)
    Cosine2DSmoothing ->
      ({ model
       | noise2D = f2DNoise model.data2DNoiseX model.permutationTable2D cosineSmoothing
       , smoothing2D = cosineSmoothing
       }, Cmd.none)

    EyeX value ->
      ({ model | eye = Vec3.setX value model.eye }, Cmd.none)
    EyeY value ->
      ({ model | eye = Vec3.setY value model.eye }, Cmd.none)
    EyeZ value ->
      ({ model | eye = Vec3.setZ value model.eye }, Cmd.none)

    NewOffset value ->
      ({ model | offset2D = value }, Cmd.none)

    NewFrequency value ->
      ({ model | frequency2D = value }, Cmd.none)

    NewAmplitude value ->
      ({ model | amplitude2D = value }, Cmd.none)

    Tick newTime ->
      let
        fXY = (\x y -> fPerlin (x + model.offset2D) (y + model.offset2D))
        thePoints = generate2DNoise fXY model.num2DNoisePoints model.sampling2D model.scaling2D
      in
      ({ model |
          offset = 
            case model.animate of
              True ->
                model.offset + 0.1
              False ->
                model.offset
        , offset2D =
            case model.animate2D of
                True ->
                  let
                    dt = model.offset2D - (toFloat <| floor model.offset2D)
                  in
                  (toFloat <| modBy 512 (floor model.offset2D)) + dt + 0.1
                False ->
                  model.offset2D
        }, Cmd.none)



-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  Time.every 100 Tick


-- VIEW


sumArrayPointList : List ArrayPoint -> List ArrayPoint -> List ArrayPoint
sumArrayPointList one two =
  List.map2 (\a b -> 
    { x = a.x
    , y = a.y
    , height = a.height + b.height
    , gradient = a.gradient + b.gradient
    , upHeight = a.upHeight + b.upHeight
    , rightHeight = a.rightHeight + b.rightHeight
    , downHeight = a.downHeight + b.downHeight
    , leftHeight = a.leftHeight + b.leftHeight
    , upGradient = a.upGradient + b.upGradient
    , rightGradient = a.rightGradient + b.rightGradient
    , downGradient = a.downGradient + b.downGradient
    , leftGradient = a.leftGradient + b.leftGradient

    }) one two


view : Model -> Html Msg
view model =
  let
    transform = toFloat >> (\x -> x / toFloat model.sampling) >> generate1DNoiseTransform model.offset
    pointCounts = model.num2DNoisePoints
    samplingAmount = toFloat model.sampling2D
    --fXY = (\x y -> model.noise2D (x + model.offset2D) (y + model.offset2D))
    fXY = (\x y -> (fPermutationPerlin model.smoothing2D perlinGradients perlinPermutations) (x + model.offset2D) (y + model.offset2D))
    points = generate2DNoise fXY model.num2DNoisePoints model.sampling2D model.scaling2D model.frequency2D model.amplitude2D
    arrayPoints = pointsArrayToList <| generate2DArrayNoise fXY model.num2DNoisePoints model.sampling2D model.frequency2D model.amplitude2D
    --arrayPoints2 = pointsArrayToList <| generate2DArrayNoise fXY model.num2DNoisePoints model.sampling2D 2 0.5
    --arrayPoints3 = pointsArrayToList <| generate2DArrayNoise fXY model.num2DNoisePoints model.sampling2D 4 0.25
    --arrayPoints4 = pointsArrayToList <| generate2DArrayNoise fXY model.num2DNoisePoints model.sampling2D 8 0.125
    --arrayPoints5 = pointsArrayToList <| generate2DArrayNoise fXY model.num2DNoisePoints model.sampling2D 16 0.0625

    --arrayPointsAll = List.foldr sumArrayPointList arrayPoints [arrayPoints2, arrayPoints3, arrayPoints4, arrayPoints5]

  in
  div
    [ style "margin-left" "20%"
    , style "margin-right" "20%"
    , style "margin-top" "100px"
    ]
    [ {-h1 [] [ text "1D Noise" ]
    , div [] 
      [ text "Points "
      , input [ placeholder "Number 1D Noise Points", value <| String.fromInt model.num1DNoisePoints ] []
      , button [ onClick IncreasePoints ] [ text "+1" ]
      , button [ onClick DecreasePoints ] [ text "-1" ]
      ]
    , div [] 
      [ text "Sampling "
      , input [ placeholder "Amount to subsample intervals", value <| String.fromInt model.sampling ] []
      , button [ onClick IncreaseSampling ] [ text "+1" ]
      , button [ onClick DecreaseSampling ] [ text "-1" ]
      ]
    , div []
      [ text "Offset "
      , input [ placeholder "Offset", value <| String.fromFloat model.offset ] []
      , button [ onClick IncreaseOffset ] [ text "+0.2" ]
      , button [ onClick DecreaseOffset ] [ text "-0.2" ]
      ]
    , div []
      [ text "Smoothing "
      , button [ onClick NoSmoothing ] [ text "None" ]
      , button [ onClick CosineSmoothing ] [ text "Cosine" ]
      ]
    , button [ onClick ToggleAnimate ] [ text "Toggle Animation" ]
    --, text <| List.foldr (++) "" <| List.map (String.fromFloat >> (\x -> ", " ++ x)) <| List.map transform <| List.range 0 (model.sampling * (model.num1DNoisePoints - 1))
    , render1DNoise model
    ,-} h1 [] [ text "2D Perlin Noise" ]
    , div [] [ text "Instructions: 2D Perlin noise generator and terrain map." ]
    , div [] [ text "1) Points determine how many tiles make up the mesh width and height. Sampling determines how frequently we subsample each tile. This makes the total number of points along a mesh edge Points*Sampling." ]
    , div [] [ text "2) Offset determines how many steps to adjust the X and Y coordinates on the grid for the Perlin Noise function." ]
    , div [] [ text "3) Frequency determines how quickly we cycle through the Perlin Noise generator to repeat the pattern" ]
    , div [] [ text "4) Amplitude scales noise generated value." ]
    , div [] [ text "5) Smoothing determines whether the interpolation should be a linear function (None) or an S shaped curve (Cosine)." ]
    , div [] [ text "6) Toggle Animation can start or stop the iteration if you would like to manually inspect a certain offset." ]
    , div [] [ text "7) EyeX, EyeY, and EyeZ control the viewpoint location. The mesh is always centered at the origin (0, 0, 0) along the XY plane. The point determined by (EyeX, EyeY, EyeZ) is where we look at the origin from." ]
    , div []
    [
     div [] 
      [ text "Points "
      , input [ placeholder "Number 2D Noise Points Per Side", value <| String.fromInt model.num2DNoisePoints ] []
      , button [ onClick Increase2DPoints ] [ text "+1" ]
      , button [ onClick Decrease2DPoints ] [ text "-1" ]
      ]
    , div [] 
      [ text "Sampling "
      , input [ placeholder "Amount to subsample intervals", value <| String.fromInt model.sampling2D ] []
      , button [ onClick Increase2DSampling ] [ text "+1" ]
      , button [ onClick Decrease2DSampling ] [ text "-1" ]
      ]
    , div []
      [ input 
          [ type_ "range"
          , Html.Attributes.min "0"
          , Html.Attributes.max "512"
          , Html.Attributes.step "0.1"
          , Html.Attributes.value <| String.fromFloat <| model.offset2D
          , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> NewOffset)
          ] []
      , text <| (++) "Offset: " <| String.fromFloat <| model.offset2D
      ]
    , div []
        [ input 
            [ type_ "range"
            , Html.Attributes.min "0"
            , Html.Attributes.max "3"
            , Html.Attributes.step "0.1"
            , Html.Attributes.value <| String.fromFloat <| model.frequency2D
            , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> NewFrequency)
            ] []
        , text <| (++) "Frequency: " <| String.fromFloat <| model.frequency2D
        ]
    , div []
        [ input 
            [ type_ "range"
            , Html.Attributes.min "0"
            , Html.Attributes.max "3"
            , Html.Attributes.step "0.1"
            , Html.Attributes.value <| String.fromFloat <| model.amplitude2D
            , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> NewAmplitude)
            ] []
        , text <| (++) "Amplitude: " <| String.fromFloat <| model.amplitude2D
        ]
    , div []
      [ text "Smoothing "
      , button [ onClick No2DSmoothing ] [ text "None" ]
      , button [ onClick Cosine2DSmoothing ] [ text "Cosine" ]
      ]
    , div []
      [ text "Scaling "
      , input [ placeholder "Scaling factor", value <| String.fromFloat model.scaling2D ] []
      , button [ onClick Increase2DScaling ] [ text "+0.05" ]
      , button [ onClick Decrease2DScaling ] [ text "-0.05" ]
      ]
    , button [ onClick Toggle2DAnimate ] [ text "Toggle Animation" ]
    
    --, render2DSVGNoise model
    --, text <| List.foldr (++) "" <| List.map (String.fromFloat >> (\x -> ", " ++ x)) <| List.map transform <| List.range 0 (model.sampling * (model.num1DNoisePoints - 1))
    --, text <| List.foldr (++) "" 
    --    <| List.map (\(x, y) -> "(" ++ (String.fromFloat x) ++ "," ++ (String.fromFloat y) ++ "," ++ (String.fromFloat (fXY x y)) ++ ")" )
    --    <| List.map (\(x, y) -> (toFloat x / samplingAmount, toFloat y / samplingAmount))
    --    <| generateGridCoordinates (pointCounts*model.sampling2D) (pointCounts*model.sampling2D)
    , div []
      [ input 
          [ type_ "range"
          , Html.Attributes.min "-10"
          , Html.Attributes.max "10"
          , Html.Attributes.step "0.1"
          , Html.Attributes.value <| String.fromFloat <| Vec3.getX model.eye
          , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> EyeX)
          ] []
      , text <| (++) "EyeX: " <| String.fromFloat <| Vec3.getX model.eye
      ]
    , div []
      [ input 
          [ type_ "range"
          , Html.Attributes.min "-10"
          , Html.Attributes.max "10"
          , Html.Attributes.step "0.1"
          , Html.Attributes.value <| String.fromFloat <| Vec3.getY model.eye
          , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> EyeY)
          ] []
      , text <| (++) "EyeY: " <| String.fromFloat <| Vec3.getY model.eye
      ]
    , div []
      [ input 
          [ type_ "range"
          , Html.Attributes.min "-10"
          , Html.Attributes.max "10"
          , Html.Attributes.step "0.1"
          , Html.Attributes.value <| String.fromFloat <| Vec3.getZ model.eye
          , Html.Events.onInput (String.toFloat >> Maybe.withDefault 0 >> EyeZ)
          ] []
      , text <| (++) "EyeZ: " <| String.fromFloat <| Vec3.getZ model.eye
      ]
    ,  div [
        style "display" "flex"
      ]
      [
       render2DGLNoise model.eye model.num2DNoisePoints model.sampling2D points
    , --render2DGLSurface model model.eye model.center model.upAxis
      render2DGLSurface model.eye model.num2DNoisePoints model.sampling2D arrayPoints]
    ]
    ]


render2DGrid : (Float -> Float) -> (Float -> Float) -> (Float -> Float) -> (Float -> Float) -> Float -> List (Float, Float) -> Svg Msg
render2DGrid fX fY pixelX pixelY size points =
  g []
    <| List.map (\(pX, pY) ->
        let
          gradient = String.fromFloat <| 255 * (lerp (fX pX) (fY pY) 0.5)
        in
          rect
            [ fill <| "rgb(" ++ gradient ++ "," ++ gradient ++ "," ++ gradient ++ ")"
            , x <| String.fromFloat (pixelX pX) ++ "px"
            , y <| String.fromFloat (pixelY pY) ++ "px"
            , width <| String.fromFloat size ++ "px"
            , height <| String.fromFloat size ++ "px"
            ]
            []) points



scaler : Float -> (Float, Float, Float) -> (Float, Float, Float)
scaler factor (x, y, z) =
  (x*factor, y*factor, z)



render2DSVGNoise : Model -> Html Msg
render2DSVGNoise model =
  let
    fXY = (\x y -> (fPermutationPerlin model.smoothing2D perlinGradients perlinPermutations) (x + model.offset2D) (y + model.offset2D))
    points = generate2DNoise fXY model.num2DNoisePoints model.sampling2D model.scaling2D model.frequency2D model.amplitude2D
    edgeLength = ((model.width2D - 10) / toFloat (model.num2DNoisePoints * model.sampling2D))
  in
    svg
      [ width <| String.fromFloat <| model.width2D
      , height <| String.fromFloat <| model.height2D
      ]
      [ renderBorder model.width2D model.height2D
      , render2DSVGGrid edgeLength model.xToPixel2D model.yToPixel2D points
      ]



render2DSVGGrid : Float -> (Float -> Float) -> (Float -> Float) -> List (Float, Float, Float) ->  Html Msg
render2DSVGGrid edgeLength transformX transformY points =
  g
    []
    <| List.map (\(px, py, gradient) ->
        rect
          [ fill <| "rgb("  ++ gradient ++ "," ++ gradient ++ "," ++ gradient ++ ")"
          , x <| String.fromFloat (transformX px) ++ "px"
          , y <| String.fromFloat (transformY py) ++ "px"
          , width <| String.fromFloat edgeLength ++ "px"
          , height <| String.fromFloat edgeLength ++ "px"
          ]
          []
      ) <| List.map (\(x, y, z) -> (x, y, String.fromFloat (255*z) )) <| points


test2DPoints : List (Float, Float, Float)
test2DPoints =
  [ (0, 0.75,  0.1), (0.25, 0.75,  0.9), (0.5, 0.75,  0.1), (0.75, 0.75,  0.9)
  , (0,  0.5,  0.9), (0.25,  0.5,  0.9), (0.5,  0.5,    0), (0.75,  0.5,    0)
  , (0, 0.25, 0.75), (0.25, 0.25,  0.5), (0.5, 0.25, 0.25), (0.75, 0.25,    0)
  , (0,    0,    0), (0.25,    0, 0.25), (0.5,    0,  0.5), (0.75,    0, 0.75)
  ]


test2DArrayPoints : List ArrayPoint
test2DArrayPoints =
  List.map (\(x, y, gradient) ->
    { x = x
    , y = y
    , height = gradient
    , upHeight = gradient
    , rightHeight = gradient
    , downHeight = gradient
    , leftHeight = gradient
    , gradient = gradient
    , upGradient = gradient
    , rightGradient = gradient
    , downGradient = gradient
    , leftGradient = gradient
    }) test2DPoints


test2DNumPoints : Int
test2DNumPoints =
  2

test2DSampling : Int
test2DSampling =
  2


render2DGLNoise : Vec3 -> Int -> Int -> List (Float, Float, Float) -> Html Msg
render2DGLNoise modelEye numPoints sampling points =
  {- 
    The points are a list of (x, y, gradient) values where x \in [0, 1], y \in [0, 1], gradient \in [-1, 1].
    For WebGL the fields must be scaled such that:
      x-axis \in [-1, 1]
      y-axis \in [-1, 1]
      gradient \in [0, 1]
  -}

  let
    --fXY = (\x y -> (fPermutationPerlin model.smoothing2D perlinGradients perlinPermutations) (x + model.offset2D) (y + model.offset2D))
    --points = generate2DNoise fXY model.num2DNoisePoints model.sampling2D model.scaling2D
    --points = test2DPoints
    edgeScale = 2
    edgeLength = edgeScale * (1 / toFloat (numPoints * sampling))
    transform = (\n -> edgeScale*n - 1)
    gradientTransform = (\n -> (n + 1)/2 )
    
    --eye = Mat4.transform (Mat4.makeTranslate (vec3 0 0 (1/ tan(22.5 * pi / 180)))) (vec3 0 0 0)
    --eye = Mat4.transform (Mat4.makeTranslate (vec3 2 -2 2)) (vec3 0 0 0)
    eye = Mat4.transform (Mat4.makeTranslate modelEye) (vec3 0 0 0)
    center = (vec3 0 0 0)
    --up = Mat4.transform (Mat4.makeRotate (pi/100) (vec3 0 0 1)) (vec3 0 1 0)
    up = vec3 0 1 0
    --moveEye2 = Mat4.transform (Mat4.makeRotate (pi/4) (vec3 0 0 1)) moveEye
    --equal = Debug.log "cehck" <| moveEye == (vec3 0 0 (1/ tan(22.5 * pi / 180)))


    glPoints = List.map (\(x, y, gradient) -> (transform x, transform y, gradientTransform gradient)) points
  in
    WebGL.toHtml
      [ Html.Attributes.width 400
      , Html.Attributes.height 400
      , style "display" "block"
      , style "border-style" "solid"
      ]
      [ WebGL.entity
          vertexShader
          fragmentShader
          (mesh edgeLength glPoints)
          { perspective = Mat4.mul 
                  (Mat4.makePerspective 45 1 0.01 100)
                  (Mat4.makeLookAt eye center up ) }
      ]



type alias ArrayPoint =
  { x : Float
  , y : Float
  , height : Float
  , upHeight : Float
  , rightHeight : Float
  , downHeight : Float
  , leftHeight : Float
  , gradient : Float
  , upGradient : Float
  , rightGradient : Float
  , downGradient : Float
  , leftGradient : Float
  }


pointsArrayToList : Array (Array Float) -> List ArrayPoint
pointsArrayToList points =
  let
    rows = ((Array.length points)-1)
  in
  List.range 0 rows
    |> List.map (\iY ->
      let
        columns = ((Array.get iY points |> Maybe.withDefault (Array.fromList []) |> Array.length)-1)
      in
        List.range 0 columns
          |> List.map (\iX ->
              let
                gradient = Array.get iY points |> Maybe.withDefault (Array.fromList []) |> Array.get iX |> Maybe.withDefault 0
                upGradient = Array.get (iY+1) points |> Maybe.withDefault (Array.fromList []) |> Array.get iX |> Maybe.withDefault gradient
                rightGradient = Array.get iY points |> Maybe.withDefault (Array.fromList []) |> Array.get (iX + 1) |> Maybe.withDefault gradient
                downGradient = Array.get (iY - 1) points |> Maybe.withDefault (Array.fromList []) |> Array.get iX |> Maybe.withDefault gradient
                leftGradient = Array.get iY points |> Maybe.withDefault (Array.fromList []) |> Array.get (iX - 1) |> Maybe.withDefault gradient
              in
                { x = toFloat iX / toFloat columns
                , y = toFloat iY / toFloat rows
                , height = gradient
                , upHeight = upGradient
                , rightHeight = rightGradient
                , downHeight = downGradient
                , leftHeight = leftGradient
                , gradient = gradient
                , upGradient = upGradient
                , rightGradient = rightGradient
                , downGradient = downGradient
                , leftGradient = leftGradient
                }
            )
      )
    |> List.concat



render2DGLSurface : Vec3 -> Int -> Int -> List ArrayPoint -> Html Msg
render2DGLSurface modelEye numPoints sampling points =
  let
    --fXY = (\x y -> (fPermutationPerlin model.smoothing2D perlinGradients perlinPermutations) (x + model.offset2D) (y + model.offset2D))
    --points = generate2DNoise fXY model.num2DNoisePoints model.sampling2D model.scaling2D
    --points = test2DPoints
    edgeScale = 2
    edgeLength = edgeScale * (1 / toFloat (numPoints * sampling))
    --edgeLength = edgeScale * (1 / toFloat (test2DNumPoints * test2DSampling))
    sign = (\s -> case s < 0 of
      True ->
        -1
      False ->
        1
      )
    --gradientScale = (\g -> g + ( ((1 - g)/4) * sign (g - 0.5)  ))
    gradientScale = (\g -> g + ( ((1 - g)/4) * sign (g - 0.5)  ))

    transform = (\n -> edgeScale*n - 1)
    --gradientTransform = (\n -> (n + 1)/2 ) -->> gradientScale
    --shift = 1 + 0.5 + 0.25 + 0.125 + 0.0625
    shift = 1

    gradientTransform = (\n -> (n + shift)/(2*shift) ) -->> gradientScale
    
    --eye = Mat4.transform (Mat4.makeTranslate (vec3 0 0 (1/ tan(22.5 * pi / 180)))) (vec3 0 0 0)
    --eye = Mat4.transform (Mat4.makeTranslate (vec3 2 -2 2)) (vec3 0 0 0)
    eye = Mat4.transform (Mat4.makeTranslate modelEye) (vec3 0 0 0)
    --eye = Mat4.transform (Mat4.makeTranslate (vec3 0 0 4)) (vec3 0 0 0)
    center = (vec3 0 0 0)
    --up = Mat4.transform (Mat4.makeRotate (pi/100) (vec3 0 0 1)) (vec3 0 1 0)
    up = vec3 0 1 0
    --moveEye2 = Mat4.transform (Mat4.makeRotate (pi/4) (vec3 0 0 1)) moveEye
    --equal = Debug.log "cehck" <| moveEye == (vec3 0 0 (1/ tan(22.5 * pi / 180)))


    --glPoints = List.map (\p -> (transform p.x, transform p.y, gradientTransform p.gradient)) points
    

    glPoints = List.map (\p -> 
      { p 
      | x = transform p.x
      , y = transform p.y
      , height = p.height
      , upHeight = p.upHeight
      , rightHeight = p.rightHeight
      , downHeight = p.downHeight
      , leftHeight = p.leftGradient
      , gradient = gradientTransform p.gradient
      , upGradient = gradientTransform p.upGradient
      , rightGradient = gradientTransform p.rightGradient
      , downGradient = gradientTransform p.downGradient
      , leftGradient = gradientTransform p.leftGradient
      }) points
    --glPoints = List.map (\p -> (transform p.x, transform p.y, gradientTransform p.gradient)) test2DArrayPoints
    --glPoints = List.map (\(x, y, gradient) -> (transform x, transform y, gradientTransform gradient)) test2DPoints
  in
    WebGL.toHtml
      [ Html.Attributes.width 400
      , Html.Attributes.height 400
      , style "display" "block"
      , style "border-style" "solid"
      ]
      [ WebGL.entity
          vertexShader
          fragmentShader
          --(mesh edgeLength glPoints)
          (ridges edgeLength glPoints)
          { perspective = Mat4.mul 
                  (Mat4.makePerspective 45 1 0.01 100)
                  (Mat4.makeLookAt eye center up ) }
      ]

--render2dGLGrid : (Float -> Float) -> (Float -> Float) -> (Float -> Float) -> (Float -> Float) -> Float -> List (Float, Float) -> Svg Msg



render1DNoise : Model -> Html Msg
render1DNoise model =
  let
    fX = model.noise1DX >> model.xToPixel1D
    fY = (\x -> x + model.offset) >> model.noise1DY >> model.yToPixel1D
    transform = toFloat >> (\x -> x / toFloat model.sampling) -->> generate1DNoiseTransform model.offset
    xCoords = List.map transform <| List.range 0 (model.sampling * (model.num1DNoisePoints - 1))
    alternativeXCoords = List.map transform <| List.range 1 (model.sampling * (model.num1DNoisePoints - 1))
  in
    svg
      [ width <| String.fromFloat <| model.width1D
      , height <| String.fromFloat <| model.height1D
      ]
      [ renderBorder model.width1D model.height1D
      --, render1DPoints model.num1DNoisePoints [] --model.data1DNoise
      , render1DPoints fX fY xCoords
      , render1DLines fX fY (List.map2 Tuple.pair xCoords alternativeXCoords )
      ]


generate1DNoiseTransform : Float -> (Float -> Float)
generate1DNoiseTransform offset =
  (\x -> x + offset)


generate1DNoisePixel : Float -> Float -> (Float -> Float)
generate1DNoisePixel width numPoints =
  (\x -> width * x / numPoints)


renderBorder : Float -> Float -> Svg Msg
renderBorder borderWidth borderHeight =
  g
    []
    [
      rect
        [ fill "rgb(0,0,0)"
        , width <| String.fromFloat borderWidth ++ "px"
        , height <| String.fromFloat borderHeight ++ "px"
        ]
        []
    , rect
        [ fill "rgb(255,255,255)"
        , width <| String.fromFloat (borderWidth - 10) ++ "px"
        , height <| String.fromFloat (borderHeight - 10) ++ "px"
        , x <| String.fromFloat 5
        , y <| String.fromFloat 5
        ]
        []
    ]






pointToDot : (Float -> Float) -> (Float -> Float) -> Float -> Svg Msg
pointToDot fX fY x =
  circle 
      [ cx <| String.fromFloat <| fX x
      , cy <| String.fromFloat <| fY x
      , r "5"
      ]
      []


render1DPoints : (Float -> Float) -> (Float -> Float) -> List Float -> Svg Msg
render1DPoints fX fY points =
  g
    []
    (List.map (pointToDot fX fY) points)
    
  


pairToLine : (Float -> Float) -> (Float -> Float) -> (Float, Float) -> Svg Msg
pairToLine fX fY ((xOne, xTwo) as pair) =
  line
    [ x1 <| String.fromFloat <| fX xOne
    , y1 <| String.fromFloat <| fY xOne
    , x2 <| String.fromFloat <| fX xTwo
    , y2 <| String.fromFloat <| fY xTwo
    , stroke "rgb(0,0,0)"
    , strokeWidth "2"]
    []


render1DLines : (Float -> Float) -> (Float -> Float) -> List (Float, Float) -> Svg Msg
render1DLines fX fY pairs =
  g
    []
    (List.map (pairToLine fX fY) pairs)





perspective : Float -> Mat4
perspective t =
  Mat4.mul
    (Mat4.makePerspective 45 1 0.01 100)
    (Mat4.makeLookAt (vec3 (4 * cos t) 0 (4 * sin t)) (vec3 0 0 0) (vec3 0 1 0))

      



-- Mesh


type alias Vertex =
    { position : Vec3
    , color : Vec3
    }



generate2DNoise : (Float -> Float -> Float) -> Int -> Int -> Float -> Float -> Float -> List (Float, Float, Float)
generate2DNoise fXY pointCounts sampling scaling frequency amplitude =
  let
    numPoints = toFloat pointCounts
    samplingAmount = toFloat sampling
  in
    generateGridCoordinates (pointCounts*sampling) (pointCounts*sampling)
      |> List.map (\(x, y) -> (toFloat x, toFloat y))
      |> List.map (\(x, y) ->
          let
            --gradient = ((fXY x y) + 1) * scaling
            gradient = amplitude * (fXY (frequency * x/samplingAmount) (frequency * y/samplingAmount))
          in
            (x/(numPoints*samplingAmount), y/(numPoints*samplingAmount), gradient)
          )




generate2DArrayTiling : (Float -> Float -> Float) -> Int -> Int -> Float -> List (Float, Float, Float)
generate2DArrayTiling fXY pointCounts sampling scaling =
  let
    numPoints = toFloat pointCounts
    samplingAmount = toFloat sampling
  in
    generateGridCoordinates (pointCounts*sampling) (pointCounts*sampling)
      |> List.map (\(x, y) -> (toFloat x / samplingAmount, toFloat y / samplingAmount))
      |> List.map (\(x, y) ->
          let
            gradient = ((fXY x y) + 1) * scaling
          in
            (x, y, gradient)
          )


--mesh : (Float -> Float) -> (Float -> Float) -> Int -> Int -> Mesh Vertex
--mesh fX fY pointCounts sampling =
--mesh : (Float -> Float -> Float) -> Int -> Int -> Float -> Mesh Vertex
--mesh fXY pointCounts sampling scaling =

mesh : Float -> List (Float, Float, Float) -> Mesh Vertex
mesh edgeLength points =
  WebGL.triangles
    <| List.concat <| List.map (\(x, y, gradient) ->
      [ ( Vertex (vec3 x y 0) (vec3 gradient gradient gradient)
        , Vertex (vec3 x (y+edgeLength) 0) (vec3 gradient gradient gradient)
        , Vertex (vec3 (x+edgeLength) y 0) (vec3 gradient gradient gradient)
        )
      , ( Vertex (vec3 (x+edgeLength) (y+edgeLength) 0) (vec3 gradient gradient gradient)
        , Vertex (vec3 x (y+edgeLength) 0) (vec3 gradient gradient gradient)
        , Vertex (vec3 (x+edgeLength) y 0) (vec3 gradient gradient gradient)
        )
      ]) <| points


ridges : Float -> List ArrayPoint -> Mesh Vertex
ridges edgeLength points =
  WebGL.triangles
    <| List.concat
    <| List.map (\p ->
        let
          gradient = p.gradient
          upGradient = p.upGradient
          rightGradient = p.rightGradient
          downGradient = p.downGradient
          leftGradient = p.leftGradient
          x = p.x
          y = p.y
          mid = edgeLength / 2
          height = p.height
          upHeight = p.upHeight
          rightHeight = p.rightHeight
          downHeight = p.downHeight
          leftHeight = p.leftHeight
          height2 = (\a b -> (lerp a b 0.5))
          red = gradient
          blue = 1 - gradient
          color = (\c -> vec3 (c) 0 (1-c))
        in
          [ {-( Vertex (vec3 x y 0) (vec3 gradient gradient gradient)
            , Vertex (vec3 x (y+edgeLength) 0) (vec3 gradient gradient gradient)
            , Vertex (vec3 (x+edgeLength) y 0) (vec3 gradient gradient gradient)
            )
          , ( Vertex (vec3 (x+edgeLength) (y+edgeLength) 0) (vec3 gradient gradient gradient)
            , Vertex (vec3 x (y+edgeLength) 0) (vec3 gradient gradient gradient)
            , Vertex (vec3 (x+edgeLength) y 0) (vec3 gradient gradient gradient)
            )-}
          -- left
            ( Vertex (vec3 (x + mid) (y + mid) height) (color gradient)
            , Vertex (vec3 x (y+edgeLength) (height2 upHeight leftHeight)) (color <| (upGradient + leftGradient)/2 )
            , Vertex (vec3 x y (height2 leftHeight downHeight)) (color <| (leftGradient + downGradient)/2 )
            )
          -- top
          , ( Vertex (vec3 (x+mid) (y+mid) height) (color gradient)
            , Vertex (vec3 (x+edgeLength) (y+edgeLength) (height2 upHeight rightHeight)) (color <| (upGradient + rightGradient)/2 )
            , Vertex (vec3 x (y+edgeLength) (height2 upHeight leftHeight)) (color <| (upGradient + leftGradient)/2 )
            )
          -- right
          , ( Vertex (vec3 (x+mid) (y+mid) height) (color gradient)
            , Vertex (vec3 (x+edgeLength) y (height2 rightHeight downHeight)) (color <| (rightGradient + downGradient)/2 )
            , Vertex (vec3 (x+edgeLength) (y+edgeLength) (height2 rightHeight upHeight)) (color <| (rightGradient + upGradient)/2 )
            )
          -- bottom
          , ( Vertex (vec3 (x+mid) (y+mid) height) (color gradient)
            , Vertex (vec3 x y (height2 leftHeight downHeight)) (color <| (leftGradient + downGradient)/2 )
            , Vertex (vec3 (x+edgeLength) y (height2 downHeight rightHeight)) (color <| (downGradient + rightGradient)/2 )
            )
          ]
      ) points

  
{-}
    <| List.concat <| List.map (\(x, y, gradient) ->
      [ ( Vertex (vec3 x y 0) (vec3 gradient gradient gradient)
        , Vertex (vec3 x (y+edgeLength) 0.1) (vec3 gradient gradient gradient)
        , Vertex (vec3 (x+edgeLength) y 0.1) (vec3 gradient gradient gradient)
        )
      , ( Vertex (vec3 (x+edgeLength) (y+edgeLength) 0) (vec3 gradient gradient gradient)
        , Vertex (vec3 x (y+edgeLength) 0.1) (vec3 gradient gradient gradient)
        , Vertex (vec3 (x+edgeLength) y 0.1) (vec3 gradient gradient gradient)
        )
      ]) <| points

    --numPoints = toFloat pointCounts
    --samplingAmount = toFloat sampling
    --transform = (\n -> (n / numPoints) * 2 - 1 )
    --normalize = 1
-}


generateGridCoordinates : Int -> Int -> List (Int, Int)
generateGridCoordinates w h =
  List.concat
    <| List.map (\y ->
        List.map2 Tuple.pair
          (List.range 0 (w-1))
          (List.repeat w y)
      )
    <| List.range 0 (h-1)



--type alias GridCoordinates =
--  Array (Array (Float, Float, Float))

generate2DArrayNoise : (Float -> Float -> Float) -> Int -> Int -> Float -> Float -> Array(Array Float)
generate2DArrayNoise fXY pointCounts sampling frequency amplitude =
  let
    numPoints = toFloat pointCounts
    samplingAmount = toFloat sampling
  in
    generateArrayGridCoordinates (pointCounts*sampling) (pointCounts*sampling)
      |> Array.map (\row -> Array.map (\(x, y) -> (toFloat x, toFloat y) ) row)
      |> Array.map (\row -> Array.map (\(x, y) -> amplitude * (fXY (frequency * x/samplingAmount) (frequency * y/samplingAmount)) ) row)


generateArrayGridCoordinates : Int -> Int -> Array(Array (Int, Int))
generateArrayGridCoordinates w h =
  Array.fromList
    <| List.map (\y ->
        Array.fromList <| List.map2 Tuple.pair
          (List.range 0 (w-1))
          (List.repeat h y)
      )
    <| List.range 0 (h-1)


-- Shaders


type alias Uniforms =
    { perspective : Mat4 }


vertexShader : Shader Vertex Uniforms { vcolor : Vec3 }
vertexShader =
    [glsl|
        attribute vec3 position;
        attribute vec3 color;
        uniform mat4 perspective;
        varying vec3 vcolor;
        void main () {
            gl_Position = perspective * vec4(position, 1.0);//perspective * vec4(position, 1.0);
            vcolor = color;
        }
    |]


fragmentShader : Shader {} Uniforms { vcolor : Vec3 }
fragmentShader =
    [glsl|
        precision mediump float;
        varying vec3 vcolor;
        void main () {
            gl_FragColor = vec4(vcolor, 1.0);
        }
    |]



surfaceVertexShader : Shader Vertex Uniforms { vcolor : Vec3 }
surfaceVertexShader =
    [glsl|
        attribute vec3 position;
        attribute vec3 color;
        uniform mat4 perspective;
        varying vec3 vcolor;
        void main () {
            gl_Position = perspective * vec4(position, 1.0);//perspective * vec4(position, 1.0);
            vcolor = color;
        }
    |]


surfaceFragmentShader : Shader {} Uniforms { vcolor : Vec3 }
surfaceFragmentShader =
    [glsl|
        precision mediump float;
        varying vec3 vcolor;
        void main () {
            gl_FragColor = vec4(vcolor, 1.0);
        }
    |]

