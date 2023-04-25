def sieve_of_eratosthenes(n: int) -> list[int]:
    """
    Returns a list of prime numbers up to and including n, using the Sieve of Eratosthenes algorithm.
    
    Args:
    - n: An integer representing the upper bound of the range to search for primes in.
    
    Returns:
    - A list of prime numbers up to and including n.
    
    Examples:
    
    >>> sieve_of_eratosthenes(10)
    [2, 3, 5, 7]
    
    >>> sieve_of_eratosthenes(20)
    [2, 3, 5, 7, 11, 13, 17, 19]
    """
    primes = [True] * (n + 1)
    primes[0] = primes[1] = False

    for i in range(2, int(n ** 0.5) + 1):
        if primes[i]:
            for j in range(i * i, n + 1, i):
                primes[j] = False

    return [i for i in range(2, n + 1) if primes[i]]

print(sieve_of_eratosthenes(1_000_000_000))
