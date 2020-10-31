port module Mandelbrot exposing (main)

import Browser
--import Browser.Events exposing (onClick)


import Html exposing (Html, div, text, button, h1)
import Html.Attributes exposing ( style )
import Html.Events exposing (onClick)

import Json.Decode as D

import Random exposing (initialSeed, step)

import Tuple exposing (second)



-- MAIN

main : Program () Model Msg
main =
    Browser.element
      { init = init
      , update = update
      , view = view
      , subscriptions = subscriptions
      }

width = 250

height = 250



-- PORTS

--port sendMessage : String -> Cmd msg
port sendMessage : { pixels: List Pixel, mandelbrot: List Complex} -> Cmd msg
port messageReceiver : (String -> msg) -> Sub msg


-- MODEL


type alias Complex =
  { real: Float
  , imaginary: Float
  }


addComplex : Complex -> Complex -> Complex
addComplex a b =
  Complex (a.real + b.real) (a.imaginary + b.imaginary)


multiplyComplex : Complex -> Complex -> Complex
multiplyComplex a b =
  Complex (a.real * b.real - (a.imaginary * b.imaginary)) (a.real * b.imaginary + a.imaginary * b.real)


absoluteValueComplex : Complex -> Float
absoluteValueComplex c =
  sqrt (c.real * c.real + c.imaginary * c.imaginary)


squareModulus : Complex -> Float
squareModulus c =
  c.real * c.real + c.imaginary * c.imaginary

type alias Pixel =
  { red: Int
  , green: Int
  , blue: Int
  , alpha: Int
  }


type alias Model =
    { count: Int
    , pixels: List Pixel
    , seed : Random.Seed
    , mandelbrotIndex : List (Complex -> Complex, Complex)
    }


init : () -> (Model, Cmd Msg)
init _ =
    ( { count = 101
      , pixels = initializeCanvas
      , seed = initialSeed 1
      , mandelbrotIndex = initializeMandelbrotIndex
      }
    , Cmd.none
    )


minX : Float
minX = -2

maxX : Float
maxX = 2

minY : Float
minY = -2

maxY : Float
maxY = 2



axis : Float -> Float
axis x =
  let
    m = (maxY - minY) / width
    b = minY
  in
    m * x + b



initializeCanvas : List Pixel
initializeCanvas =
  List.repeat (width*height) { red = 255, blue = 255, green = 255, alpha = 255 }


initializeMandelbrotIndex : List (Complex -> Complex, Complex)
initializeMandelbrotIndex =
  List.map (\i -> 
    let
      c = Complex (axis (toFloat (modBy width i))) (axis (toFloat (floor (toFloat i / width))))
      --c = Complex (toFloat (modBy width i)) (toFloat (floor (toFloat i / width)))
    in
      (f c, c)) <| List.range 0 (width*height - 1)




f : Complex -> Complex -> Complex
f c x =
  addComplex (multiplyComplex x x) c


-- UPDATE


type Msg
    = Shuffle
    | Clear
    | ComputeMandelbrot
    | Recv String



color : Random.Generator Int
color =
  Random.int 1 255


pixelColor : Random.Generator Pixel
pixelColor =
  Random.map4 Pixel color color color color


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    Shuffle ->
      let
        --newPixels = List.map increaseRed model.pixels
        (newPixels, newSeed) = pixelRoulette (width*height) model.seed []
      in
      ( { model | pixels = newPixels, seed = newSeed }
      , sendMessage { pixels = newPixels, mandelbrot = List.map second model.mandelbrotIndex }
      )

    ComputeMandelbrot ->
      let
        newMandelbrot = calculateMandelbrot 1 model.mandelbrotIndex
        newPixels = mandelbrotIndexToPixels newMandelbrot
      in
        ( { model | mandelbrotIndex = newMandelbrot, pixels = newPixels }
        , sendMessage { pixels = newPixels, mandelbrot = List.map second model.mandelbrotIndex }
        )

    Clear ->
      let
        newPixels = initializeCanvas 
      in
      ( { model | pixels = newPixels }
      , sendMessage { pixels = newPixels, mandelbrot = List.map second model.mandelbrotIndex }
      )


    Recv message ->
      ( model
      , Cmd.none
      )


pixelRoulette : Int -> Random.Seed -> List Pixel -> (List Pixel, Random.Seed)
pixelRoulette n currentSeed pixelsSoFar =
  if 0 == n then
    (pixelsSoFar, currentSeed)
  else
    let
      (newP, newS) = step pixelColor currentSeed
    in
      pixelRoulette (n-1) newS (newP :: pixelsSoFar)
  


calculateMandelbrot : Int -> List (Complex -> Complex, Complex) -> List (Complex -> Complex, Complex)
calculateMandelbrot n mandelbrotIndex =
  if n == 0 then
    mandelbrotIndex
  else
    calculateMandelbrot (n-1) (List.map (\(fC, c) ->
      (fC, fC c)) mandelbrotIndex)


mandelbrotIndexToPixels : List (Complex -> Complex, Complex) -> List Pixel
mandelbrotIndexToPixels mandelbrotIndex =
  List.map (\(fC, c) ->
    case absoluteValueComplex c < 2 of
      True ->
        Pixel 0 0 0 255
      False ->
        Pixel 255 255 255 255
      ) mandelbrotIndex


increaseRed : Pixel -> Pixel
increaseRed ({ red, green, blue, alpha } as p) =
  { p | red = red + 1}

--rgbaGenerator


-- SUBSRIPTIONS



subscriptions : Model -> Sub Msg
subscriptions model =
  messageReceiver Recv



-- VIEW


view : Model -> Html Msg
view model =
  let
    positioning = [ style "margin-left" "auto"
      , style "margin-right" "auto"
      , style "display" "block"
      ]
  in
    div 
      []
      [ h1 [ style "text-align" "center" ] [ text "Mandelbrot Set" ]
      ,  div 
          [ style "text-align" "center" ]
          [ button [ onClick Clear ] [ text "Clear" ]
          , button [ onClick Shuffle ] [ text "Shuffle" ]
          , button [ onClick ComputeMandelbrot ] [ text "Mandelbrot" ]
          ]
      , div [ style "text-align" "center" ] [ text "Instructions:" ]
      , div [ style "text-align" "center" ] [ text "1) Press Clear to reset the screen." ]
      , div [ style "text-align" "center" ] [ text "2) Press Shuffle to generate a field of random noise." ]
      , div [ style "text-align" "center" ] [ text "3) Press Mandelbrot to resume the next iteration for computing the Mandelbrot Set. Continue pressing until changes are beyond the canvas's resolution." ]
      , div [ style "text-align" "center" ] [ text "4) Most of all. Enjoy!" ]
      ]
    




