namespace NavGuard.CSharp.MathCore;

public readonly struct Vector3D
{
    public double X { get; }
    public double Y { get; }
    public double Z { get; }

    public Vector3D(double x, double y, double z)
    {
        this.X = x;
        this.Y = y;
        this.Z = z;
    }

    public static Vector3D Zero
    {
        get
        {
            return new Vector3D(0.0, 0.0, 0.0);
        }
    }

    public double Norm()
    {
        return Math.Sqrt((this.X * this.X) + (this.Y * this.Y) + (this.Z * this.Z));
    }

    public static Vector3D operator +(Vector3D a, Vector3D b)
    {
        return new Vector3D(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
    }

    public static Vector3D operator -(Vector3D a, Vector3D b)
    {
        return new Vector3D(a.X - b.X, a.Y - b.Y, a.Z - b.Z);
    }

    
    public static Vector3D operator *(Vector3D v, double scalar)
    {
        return new Vector3D(v.X * scalar, v.Y * scalar, v.Z * scalar);
    }

    // returns the dot product of both vectors.
    public double Dot(Vector3D other)
    {
        return (this.X * other.X) + (this.Y * other.Y) + (this.Z * other.Z);
    }

    // returns the cross vector of both vectors.
    public Vector3D Cross(Vector3D other)
    {
        double x = (this.Y * other.Z) - (this.Z * other.Y);
        double y = (this.Z * other.X) - (this.X * other.Z);
        double z = (this.X * other.Y) - (this.Y * other.X);

        return new Vector3D(x, y, z);
    }

   
}