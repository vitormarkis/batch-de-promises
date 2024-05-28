import { useEffect } from "react"
import { useState } from "react"

export function PokemonPicture({ id }) {
  const { data: pokemon } = usePokemon(id)
  if (!pokemon) return "loading image"
  return (
    <img
      src={pokemon.imageUrl}
      alt={`${pokemon.name}'s picture`}
    />
  )
}

export function PokemonName({ id }) {
  const { data: pokemon } = usePokemon(id)
  if (!pokemon) return "loading name"
  return <strong>{pokemon.name}</strong>
}

function usePokemon(id) {
  const [data, setData] = useState()

  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then(res => res.json())
      .then(pokemon => {
        setData({
          imageUrl: pokemon.sprites.other.dream_world.front_default,
          name: pokemon.name,
        })
      })
  }, [id])

  return {
    data,
  }
}

function App() {
  const [id, setId] = useState(1)

  return (
    <>
      <button onClick={() => setId(p => p - 1)}>-</button>
      <span>{id}</span>
      <PokemonPicture id={id} />
      <PokemonName id={id} />
      <button onClick={() => setId(p => p + 1)}>+</button>
    </>
  )
}

export default App
