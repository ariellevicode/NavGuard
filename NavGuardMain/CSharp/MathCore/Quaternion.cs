using System.ComponentModel.DataAnnotations;

namespace NavGuard.CSharp.MathCore;

public readonly struct Quaternion
{
    public double W { get; }
    public double X { get; }
    public double Y { get; }
    public double Z { get; }

    public Quaternion(double w, double x, double y, double z)
    {
        this.W = w;
        this.X = x;
        this.Y = y;
        this.Z = z;
    }
    public static Quaternion Identity
    {
        get
        {
            return new Quaternion(1.0, 0.0, 0.0, 0.0);
        }
    }
    public double Norm()
    {
        return Math.Sqrt((this.W * this.W) + (this.X * this.X) + (this.Y * this.Y) + (this.Z * this.Z));
    }
    public Quaternion Normalize()
    {
        double length = this.Norm();
        if (length < 0.000000000001)
            return Quaternion.Identity;
        return new Quaternion(this.W / length, this.X / length, this.Y / length, this.Z / length);
    }

    // so that when we write q1 * q2 it will give us the quaterion multiplication
    public static Quaternion operator *(Quaternion a , Quaternion b)
    {
        double w = (a.W * b.W) - (a.X * b.X) - (a.Y * b.Y) - (a.Z * b.Z);
        double x = (a.W * b.X) + (a.X * b.W) + (a.Y * b.Z) - (a.Z * b.Y);
        double y = (a.W * b.Y) - (a.X * b.Z) + (a.Y * b.W) + (a.Z * b.X);
        double z = (a.W * b.Z) + (a.X * b.Y) - (a.Y * b.X) + (a.Z * b.W);

        return new Quaternion(w, x, y, z);
    }

    public Quaternion Conjugate()
    {
        return new Quaternion(this.W, -this.X, -this.Y, -this.Z);
    }
     public Vector3D RotateVector(Vector3D v)
    {
        Quaternion p = new Quaternion(0.0,v.X,v.Y,v.Z);

        Quaternion pRotated = this * p * this.Conjugate();

        return new Vector3D(pRotated.X,pRotated.Y,pRotated.Z);

    }

    public Quaternion Integrate(Vector3D omega, double dt)
    {
        
    }



}

